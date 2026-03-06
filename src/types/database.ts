export interface Profile {
  id: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
}

export interface Image {
  id: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  url: string;
  is_common_use: boolean;
  profile_id: string | null;
  additional_context: string | null;
  is_public: boolean;
  image_description: string | null;
  celebrity_recognition: string | null;
}

export interface Caption {
  id: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  content: string | null;
  is_public: boolean;
  profile_id: string | null;
  image_id: string | null;
  humor_flavor_id: number | null;
  is_featured: boolean;
  caption_request_id: number | null;
  like_count: number;
  llm_prompt_chain_id: number | null;
}
