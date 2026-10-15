// The fields a source of an answer may carry, as Builder archives them (server/ops_records.py SOURCE_FIELDS).
export type AskSource = {
  id: string; title: string; url: string; date?: string; excerpt?: string; author?: string; attribution_note?: string;
  public_copy_url?: string; reason?: string; source_type?: string; timecode?: string; source_visibility?: string;
  text_access?: string; membership_platform?: string; membership_url?: string; membership_verified_at?: string;
  transcript_source_kind?: string; transcript_quality?: string; speaker_classification?: string; evidence_role?: string;
  data_layer?: string; speaker_id?: string; speaker_name?: string; speaker_status?: string; fragment_id?: string;
  source_snapshot_sha256?: string; participant_names?: string; participant_entity_ids?: string; participant_aliases?: string;
  participant_metadata_basis?: string; speech_act?: string; content_origin?: string; generation_method?: string;
};
export function sourceAttributionLabel(source: Partial<AskSource> | null | undefined): string;
