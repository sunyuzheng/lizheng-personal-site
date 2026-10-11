"""Synthetic local-file guards; no real programme or speech data."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

TOOL = Path(__file__).absolute().parents[1] / "scripts/generate-guest-identity-overlay.py"
spec = importlib.util.spec_from_file_location("identity_generator", TOOL)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class GeneratorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        (self.root / "shared").mkdir(); (self.root / "scripts").mkdir()
        (self.root / "scripts/generate-guest-identity-overlay.py").write_bytes(TOOL.read_bytes())
        self.roster = self.root / "roster.json"
        self.roster.write_text(json.dumps([{"guest_name": "Synthetic fixture", "all_video_ids": ["00000000000"]}]))
        self.snapshot = self.root / "shared/guest-roster-snapshot.ts"
        self.snapshot.write_text("export const guestRosterSnapshot = " + self.roster.read_text() + " as const;\n")
        self.parent = self.root / "pending-parent.json"; self.parent.write_text("{}")
        self.overlay = self.root / "pending.json"
        self.value = {"schema_version": 1, "publication_approved": False,
            "source_roster_sha256": generator.digest(self.roster), "identity_evidence_sha256": "a" * 64,
            "immutable_parent": {"file": self.parent.name, "sha256": generator.digest(self.parent)},
            "source_bindings": [{"source_guest_name": "Synthetic fixture", "entity_id": "guest:fixture", "entity_type": "person",
                "display_name": "Synthetic fixture", "aliases": [], "current_job_certified": False}],
            "redirects": [], "profile_aliases": [], "new_public_entities": [],
            "reviewed_public_programme_additions": [{"entity_id": "guest:fixture", "video_id": "00000000000"}]}
        self.context = self.root / "context"; (self.context / "corpus/dialogues").mkdir(parents=True)
        self.rows = []
        for i in range(339):
            vid = f"{i:011d}"; rel = f"corpus/dialogues/youtube-{vid}.json"; p = self.context / rel
            p.write_text(json.dumps({"title": "Synthetic metadata", "published_at": "2026-01-01",
                "source_url": f"https://www.youtube.com/watch?v={vid}", "units": [{"text": "Synthetic speech never consumed"}]}))
            self.rows.append({"path": rel, "sha256": generator.digest(p), "bytes": p.stat().st_size})
        self.manifest = self.context / "release-manifest.json"
        self.save()

    def tearDown(self):
        self.temp.cleanup()

    def save(self):
        self.overlay.write_text(json.dumps(self.value)); self.manifest.write_text(json.dumps({"files": self.rows}))

    def run_generate(self, pin=None):
        return generator.generate(self.overlay, pin or generator.digest(self.overlay), self.roster, self.snapshot,
                                  self.context, generator.digest(self.manifest))

    def test_complete_metadata_no_speech_in_sidecar(self):
        value, inputs = self.run_generate()
        self.assertEqual(len(inputs), 344)
        self.assertEqual(value["programme_additions"][0]["title"], "Synthetic metadata")
        self.assertNotIn("units", json.dumps(value)); self.assertNotIn("Synthetic speech", json.dumps(value))
        self.assertFalse(value["publication_performed"])

    def test_default_dry_writes_nothing(self):
        output = self.root / "shared/guest-identity-overlay.ts"
        cmd = ["python3", str(self.root / "scripts/generate-guest-identity-overlay.py"), "--overlay", str(self.overlay),
            "--overlay-sha256", generator.digest(self.overlay), "--roster", str(self.roster), "--snapshot", str(self.snapshot),
            "--context", str(self.context), "--manifest-sha256", generator.digest(self.manifest), "--output", str(output)]
        before = {str(p): generator.digest(p) for p in self.root.rglob("*") if p.is_file()}
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        self.assertTrue(json.loads(result.stdout)["dry_run"]); self.assertFalse(output.exists())
        self.assertEqual(before, {str(p): generator.digest(p) for p in self.root.rglob("*") if p.is_file()})

    def test_overlay_parent_and_roster_drift_rejected(self):
        with self.assertRaisesRegex(ValueError, "overlay_hash_drift"):
            self.run_generate("b" * 64)
        self.parent.write_text("{\"changed\":true}")
        with self.assertRaisesRegex(ValueError, "overlay_parent_drift"):
            self.run_generate()
        self.parent.write_text("{}"); self.roster.write_text("[]")
        with self.assertRaisesRegex(ValueError, "roster_hash_drift"):
            self.run_generate()

    def test_duplicate_binding_and_addition_rejected(self):
        self.value["source_bindings"].append(self.value["source_bindings"][0]); self.save()
        with self.assertRaisesRegex(ValueError, "binding_coverage_invalid"):
            self.run_generate()
        self.value["source_bindings"].pop(); self.value["reviewed_public_programme_additions"] *= 2; self.save()
        with self.assertRaisesRegex(ValueError, "addition_identity_invalid"):
            self.run_generate()

    def test_public_file_drift_and_path_escape_rejected(self):
        p = self.context / self.rows[0]["path"]; original = p.read_bytes(); p.write_bytes(original + b" ")
        with self.assertRaisesRegex(ValueError, "public_metadata_hash_drift"):
            self.run_generate()
        p.write_bytes(original); self.rows[0]["path"] = "corpus/dialogues/../../outside.json"; self.save()
        with self.assertRaisesRegex(ValueError, "manifest_path_escape"):
            self.run_generate()

    def test_symlink_input_rejected(self):
        alias = self.root / "alias.json"; alias.symlink_to(self.overlay)
        with self.assertRaisesRegex(ValueError, "regular_input_required"):
            generator.generate(alias, generator.digest(self.overlay), self.roster, self.snapshot,
                               self.context, generator.digest(self.manifest))

    def test_identity_url_and_unknown_metadata_types_rejected(self):
        p = self.context / self.rows[0]["path"]; value = json.loads(p.read_bytes()); value["source_url"] = "https://example.org/other"
        p.write_text(json.dumps(value)); self.rows[0].update(sha256=generator.digest(p), bytes=p.stat().st_size); self.save()
        with self.assertRaisesRegex(ValueError, "public_url_identity_invalid"):
            self.run_generate()
        value["title"] = ["Not a string"]; p.write_text(json.dumps(value)); self.rows[0].update(sha256=generator.digest(p), bytes=p.stat().st_size); self.save()
        with self.assertRaisesRegex(ValueError, "public_metadata_type_invalid"):
            self.run_generate()


if __name__ == "__main__":
    unittest.main()
