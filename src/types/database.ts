// Common audit fields present on all tables
interface AuditFields {
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
}

export interface Profile extends AuditFields {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
}

export interface Image extends AuditFields {
  id: string;
  url: string | null;
  is_common_use: boolean;
  profile_id: string | null;
  additional_context: string | null;
  is_public: boolean;
  image_description: string | null;
  celebrity_recognition: string | null;
}

export interface Caption extends AuditFields {
  id: string;
  content: string | null;
  is_public: boolean;
  profile_id: string;
  image_id: string;
  humor_flavor_id: number | null;
  is_featured: boolean;
  caption_request_id: number | null;
  like_count: number;
  llm_prompt_chain_id: number | null;
}

export interface HumorFlavor extends AuditFields {
  id: number;
  description: string | null;
  slug: string;
}

export interface HumorFlavorStep extends AuditFields {
  id: number;
  humor_flavor_id: number;
  llm_temperature: number | null;
  order_by: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
}

export interface HumorFlavorMix extends AuditFields {
  id: number;
  humor_flavor_id: number;
  caption_count: number;
}

export interface CaptionRequest extends AuditFields {
  id: number;
  profile_id: string;
  image_id: string;
}

export interface LlmPromptChain extends AuditFields {
  id: number;
  caption_request_id: number;
}

export interface LlmModelResponse extends AuditFields {
  id: string;
  llm_model_response: string | null;
  processing_time_seconds: number;
  llm_model_id: number;
  profile_id: string;
  caption_request_id: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number | null;
  humor_flavor_id: number;
  llm_prompt_chain_id: number | null;
  humor_flavor_step_id: number | null;
}

export interface Term extends AuditFields {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}

export interface CaptionExample extends AuditFields {
  id: number;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}

export interface LlmModel extends AuditFields {
  id: number;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
}

export interface LlmProvider extends AuditFields {
  id: number;
  name: string;
}

export interface AllowedSignupDomain extends AuditFields {
  id: number;
  apex_domain: string;
}

export interface WhitelistedEmailAddress extends AuditFields {
  id: number;
  email_address: string;
}
