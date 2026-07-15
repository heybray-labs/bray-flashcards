ALTER TABLE "reward_tiers" ADD CONSTRAINT "reward_tiers_deck_fk" FOREIGN KEY ("content_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_content_tier_awards" ADD CONSTRAINT "ucta_deck_fk" FOREIGN KEY ("content_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_deck_fk" FOREIGN KEY ("content_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_session_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."study_sessions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "content_classification_links" ADD CONSTRAINT "ccl_deck_fk" FOREIGN KEY ("content_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
