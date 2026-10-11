#!/usr/bin/env python3
"""Deterministic, local metadata sidecar. Default preview; --apply writes a new file."""
import argparse
import hashlib
import json
from pathlib import Path
import re

SHA = re.compile(r"[a-f0-9]{64}\Z")
VIDEO = re.compile(r"[A-Za-z0-9_-]{11}\Z")
ENTITY = re.compile(r"guest:[a-z0-9][a-z0-9-]*\Z")
TYPES = {"person", "group", "virtual-character", "anonymous-label", "unresolved"}


def regular(path):
    path = Path(path).absolute()
    if any(p.is_symlink() for p in (path, *path.parents)) or not path.is_file():
        raise ValueError("regular_input_required")
    return path


def digest(path):
    return hashlib.sha256(regular(path).read_bytes()).hexdigest()


def read(path):
    def pairs(items):
        value = {}
        for key, item in items:
            if key in value:
                raise ValueError("duplicate_json_key")
            value[key] = item
        return value
    return json.loads(regular(path).read_bytes(), object_pairs_hook=pairs)


def require(condition, code):
    if not condition:
        raise ValueError(code)


def strings(value):
    return isinstance(value, list) and all(isinstance(x, str) and x for x in value)


def generate(overlay_path, overlay_sha, roster_path, snapshot_path, context, manifest_sha):
    require(SHA.fullmatch(overlay_sha) and digest(overlay_path) == overlay_sha, "overlay_hash_drift")
    overlay = read(overlay_path)
    require(type(overlay.get("schema_version")) is int and overlay["schema_version"] == 1,
            "overlay_schema_invalid")
    require(overlay.get("publication_approved") is False, "pending_overlay_required")
    parent = overlay.get("immutable_parent")
    require(isinstance(parent, dict) and set(parent) == {"file", "sha256"} and
            Path(parent["file"]).name == parent["file"] and SHA.fullmatch(parent["sha256"]), "overlay_parent_invalid")
    parent_path = regular(Path(overlay_path).absolute().parent / parent["file"])
    require(digest(parent_path) == parent["sha256"], "overlay_parent_drift")
    require(SHA.fullmatch(overlay.get("identity_evidence_sha256", "")), "identity_evidence_pin_invalid")
    require(digest(roster_path) == overlay.get("source_roster_sha256"), "roster_hash_drift")
    roster = read(roster_path)
    snapshot = regular(snapshot_path).read_text()
    literal = json.loads(snapshot[snapshot.index("["):snapshot.rindex("]") + 1])
    require(roster == literal and isinstance(roster, list), "snapshot_owner_mismatch")
    names = [x.get("guest_name") for x in roster]
    require(all(isinstance(x, str) for x in names) and len(names) == len(set(names)), "roster_identity_conflict")
    bindings = overlay.get("source_bindings")
    require(isinstance(bindings, list) and len(bindings) == len(roster), "binding_coverage_invalid")
    require({x.get("source_guest_name") for x in bindings} == set(names), "binding_identity_mismatch")
    require(len({x.get("source_guest_name") for x in bindings}) == len(bindings), "duplicate_binding")
    entities = overlay.get("new_public_entities")
    require(isinstance(entities, list), "new_entities_invalid")
    for row in bindings + entities:
        require(ENTITY.fullmatch(row.get("entity_id", "")) and row.get("entity_type") in TYPES,
                "entity_identity_invalid")
        require(isinstance(row.get("display_name"), str) and row["display_name"] and
                strings(row.get("aliases")) and row.get("current_job_certified") is False,
                "entity_metadata_invalid")
    new_ids = [x["entity_id"] for x in entities]
    bound_ids = {x["entity_id"] for x in bindings}
    require(len(new_ids) == len(set(new_ids)) and not set(new_ids) & bound_ids, "new_entity_conflict")
    redirects = overlay.get("redirects")
    require(isinstance(redirects, list), "redirects_invalid")
    from_slugs, from_ids = set(), set()
    for row in redirects:
        require(set(row) == {"from_entity_id", "canonical_entity_id", "from_slug", "canonical_slug"},
                "redirect_fields_invalid")
        require(ENTITY.fullmatch(row["from_entity_id"]) and row["canonical_entity_id"] in bound_ids and
                row["from_entity_id"] != row["canonical_entity_id"], "redirect_identity_invalid")
        require(all(re.fullmatch(r"[a-z0-9][a-z0-9-]*", row[x]) for x in ("from_slug", "canonical_slug")) and
                row["from_slug"] != row["canonical_slug"], "redirect_slug_invalid")
        require(row["from_slug"] not in from_slugs and row["from_entity_id"] not in from_ids,
                "duplicate_redirect")
        from_slugs.add(row["from_slug"]); from_ids.add(row["from_entity_id"])
    aliases = overlay.get("profile_aliases")
    require(isinstance(aliases, list), "profile_aliases_invalid")
    for row in aliases:
        require(set(row) == {"entity_id", "from_slug", "canonical_slug", "evidence_sha256"} and
                row["entity_id"] in bound_ids and SHA.fullmatch(row["evidence_sha256"]) and
                all(re.fullmatch(r"[a-z0-9][a-z0-9-]*", row[x]) for x in ("from_slug", "canonical_slug")) and
                row["from_slug"] != row["canonical_slug"] and row["from_slug"] not in from_slugs,
                "profile_alias_invalid")
        from_slugs.add(row["from_slug"])
    require(not from_ids & {x["canonical_entity_id"] for x in redirects} and
            not from_slugs & {x["canonical_slug"] for x in redirects + aliases}, "redirect_chain_invalid")
    additions = overlay.get("reviewed_public_programme_additions")
    require(isinstance(additions, list), "additions_invalid")
    pairs = [(x.get("entity_id"), x.get("video_id")) for x in additions]
    require(len(pairs) == len(set(pairs)) and all(e in bound_ids | set(new_ids) and VIDEO.fullmatch(v or "")
            for e, v in pairs), "addition_identity_invalid")
    for row in entities:
        require(strings(row.get("video_ids")) and len(row["video_ids"]) == len(set(row["video_ids"])) and
                set(row["video_ids"]) == {v for e, v in pairs if e == row["entity_id"]}, "new_programme_coverage_invalid")
    context = Path(context).absolute()
    manifest_path = regular(context / "release-manifest.json")
    require(SHA.fullmatch(manifest_sha) and digest(manifest_path) == manifest_sha, "manifest_hash_drift")
    manifest = read(manifest_path)
    raw_files = [x for x in manifest["files"] if x["path"].startswith("corpus/dialogues/")]
    require(len(raw_files) == 339, "public_manifest_coverage_invalid")
    lookup, inputs = {}, {str(regular(p)): digest(p) for p in (overlay_path, parent_path, roster_path, snapshot_path, manifest_path)}
    for row in raw_files:
        relative = Path(row["path"])
        require(not relative.is_absolute() and ".." not in relative.parts, "manifest_path_escape")
        match = re.fullmatch(r"corpus/dialogues/youtube-([A-Za-z0-9_-]{11})\.json", row["path"])
        require(match is not None, "raw_path_identity_invalid")
        path = regular(context / relative)
        require(SHA.fullmatch(row["sha256"]) and digest(path) == row["sha256"] and
                path.stat().st_size == row["bytes"], "public_metadata_hash_drift")
        video_id = match.group(1)
        require(video_id not in lookup, "duplicate_public_metadata")
        # Only these three author metadata fields are accessed. Speech units are never consumed.
        document = read(path)
        metadata = {key: document.get(key) for key in ("title", "published_at", "source_url")}
        require(all(isinstance(x, str) and x for x in metadata.values()), "public_metadata_type_invalid")
        require(metadata["source_url"] == f"https://www.youtube.com/watch?v={video_id}", "public_url_identity_invalid")
        lookup[video_id] = metadata
        inputs[str(path)] = row["sha256"]
    require(all(v in lookup for _, v in pairs), "public_programme_absent")
    result = {"schema_version": 1, "source_roster_sha256": overlay["source_roster_sha256"],
              "owner_overlay_sha256": overlay_sha, "public_manifest_sha256": digest(manifest_path),
              "identity_evidence_sha256": overlay["identity_evidence_sha256"],
              "source_bindings": bindings, "redirects": redirects, "profile_aliases": aliases, "new_public_entities": entities,
              "immutable_parent_sha256": parent["sha256"],
              "programme_additions": [{**row, **lookup[row["video_id"]]} for row in additions],
              "publication_performed": False, "approval_pending": True}
    require(all(digest(path) == value for path, value in inputs.items()), "input_drift")
    return result, inputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("overlay", "overlay-sha256", "roster", "snapshot", "context", "manifest-sha256", "output"):
        parser.add_argument("--" + name, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    value, inputs = generate(args.overlay, args.overlay_sha256, args.roster, args.snapshot, args.context, args.manifest_sha256)
    output = Path(args.output).absolute()
    root = Path(__file__).absolute().parents[1]
    require(output == root / "shared/guest-identity-overlay.ts", "output_scope_invalid")
    require(not output.exists() and not any(p.is_symlink() for p in (output, *output.parents)), "exclusive_output_required")
    content = "// Generated from the root-owned pending identity overlay; do not hand-edit.\nexport const guestIdentityOverlay = " + json.dumps(value, ensure_ascii=False, indent=2) + " as const;\n"
    if args.apply:
        with output.open("x") as handle:
            handle.write(content)
        require(all(digest(path) == pin for path, pin in inputs.items()), "post_output_input_drift")
    print(json.dumps({"dry_run": not args.apply, "bindings": len(value["source_bindings"]),
                      "redirects": len(value["redirects"]), "new_entities": len(value["new_public_entities"]),
                      "programme_additions": len(value["programme_additions"]), "input_files": len(inputs),
                      "output": str(output), "output_sha256": hashlib.sha256(content.encode()).hexdigest(),
                      "publication_performed": False}))


if __name__ == "__main__":
    main()
