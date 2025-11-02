// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Error {
			message?: string;
			code?: string;
			id?: string;
		}
		interface Locals {
			supabase: SupabaseClient;
			supabaseServerClient: SupabaseClient;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
