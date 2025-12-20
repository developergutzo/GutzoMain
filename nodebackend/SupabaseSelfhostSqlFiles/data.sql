--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter, max_presence_events_per_second, max_payload_size_in_kb) FROM stdin;
9ce5a426-4369-4719-8524-1fb91ad5e989	realtime-dev	realtime-dev	eGxa2ZKVreSn7eWieRQdp60i5H6KJLiST7splFU6MVHylMSAoQ2SjsTrTTQo/+bmYjQcO4hNnGTU+D1wtlXreA==	200	2025-11-13 18:14:20	2025-11-13 18:14:20	100	postgres_cdc_rls	100000	100	100	f	\N	f	f	65	gen_rpc	1000	3000
\.


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
9e6ca37c-03b4-443b-a98d-c1c0febfa469	postgres_cdc_rls	{"region": "us-east-1", "db_host": "QhixI0o7PYIABziLUL4f0A==", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "eGxa2ZKVreSn7eWieRQdp74vN25K+qFgdnxmDCKe4p20+C0410WXonzXTEj9CgYx", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-11-13 18:14:20	2025-11-13 18:14:20
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-11-13 14:03:52
20220329161857	2025-11-13 14:03:52
20220410212326	2025-11-13 14:03:52
20220506102948	2025-11-13 14:03:53
20220527210857	2025-11-13 14:03:53
20220815211129	2025-11-13 14:03:53
20220815215024	2025-11-13 14:03:53
20220818141501	2025-11-13 14:03:53
20221018173709	2025-11-13 14:03:53
20221102172703	2025-11-13 14:03:53
20221223010058	2025-11-13 14:03:53
20230110180046	2025-11-13 14:03:53
20230810220907	2025-11-13 14:03:53
20230810220924	2025-11-13 14:03:53
20231024094642	2025-11-13 14:03:53
20240306114423	2025-11-13 14:03:53
20240418082835	2025-11-13 14:03:53
20240625211759	2025-11-13 14:03:53
20240704172020	2025-11-13 14:03:53
20240902173232	2025-11-13 14:03:53
20241106103258	2025-11-13 14:03:53
20250424203323	2025-11-13 14:03:53
20250613072131	2025-11-13 14:03:53
20250711044927	2025-11-13 14:03:53
20250811121559	2025-11-13 14:03:53
20250926223044	2025-11-13 14:03:53
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, phone, name, email, verified, created_at, updated_at, profile_image, date_of_birth, gender, language_preference, dietary_preference, allergies, health_goals, referral_code, referred_by, total_orders, total_spent, loyalty_points, membership_tier, device_tokens, last_order_at, last_login_at, is_blocked, blocked_reason) FROM stdin;
e0d398e9-4cca-43f5-b861-12df13599056	+919003802398	Mahalskahmi	maha@gmail.ni	t	2025-09-14 07:05:32.376+00	2025-09-14 07:05:32.397013+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
2717762d-f1f3-4099-8333-a03acbf828b2	+917397725100	Shankar	shankar3107@icloud.com	t	2025-09-20 12:05:53.867+00	2025-09-20 12:05:53.906152+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
0c245f14-d001-421d-bb34-1f76287d139a	+918754756486	Lakshmi	lakshmi87@gmail.com	t	2025-11-21 06:29:24.811+00	2025-11-21 06:29:24.819316+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
55187d8f-8261-4283-9a39-15f8d5890d34	+919599089361	First Last	paytm4509@gmail.com	t	2025-11-21 10:35:57.925+00	2025-11-21 10:35:57.929917+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
91855c2c-4b22-449a-8eaf-b2eb0196054b	+919790312308	Pichammal Sundaram	pichammal@gmail.cm	t	2025-11-22 12:30:50.156+00	2025-11-22 12:30:50.175668+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
103406e8-80d7-43b4-a127-1bef9a4e29dd	+919629888617	Keerthivasan	keerthiinfo789@gmail.com	t	2025-11-23 08:04:19.618+00	2025-11-23 08:04:19.620595+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
f4cc81c0-3c55-4a03-9f6c-05b7bcd37d6c	+919876543210	Guest User	\N	t	2025-12-06 22:17:33.33+00	2025-12-06 22:17:33.592988+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	2025-12-10 15:50:03.268+00	f	\N
cead6960-10fe-4528-8cbe-efd07857eb0c	+919677100836	Raghul Ravichandran	steveraghavan@gmail.com	t	2025-12-10 16:00:16.388+00	2025-12-10 16:00:16.394698+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	\N	f	\N
b59be4e6-cc63-4f38-895f-c73e813f973c	+919944751745	Gowtham Sundaram	gowthams@gma.com	t	2025-10-04 10:40:18.604+00	2025-10-04 10:40:18.615045+00	\N	\N	\N	en	\N	\N	\N	\N	\N	0	0.00	0	bronze	\N	\N	2025-12-10 16:06:09.436+00	f	\N
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, metadata, device_type, created_at) FROM stdin;
bba9b671-95ef-49f6-9ecf-72c11144fc12	\N	app_open	app	\N	{"version": "1.0.0"}	mobile	2025-12-10 15:45:44.987158+00
af1a73a0-361d-477b-ab2f-e5c31a1f811e	\N	view_home	page	\N	{"source": "app_launch"}	mobile	2025-12-10 15:45:44.987158+00
f6820ae3-976c-4194-a017-e64f2d6e20b9	\N	search	product	\N	{"query": "protein"}	mobile	2025-12-10 15:45:44.987158+00
0141ce1d-e133-4193-a92b-7b841482aee0	\N	view_vendor	vendor	\N	{"vendor_name": "Daily Grub"}	mobile	2025-12-10 15:45:44.987158+00
2071fe02-eca8-4751-8949-ef28aaa192d6	\N	add_to_cart	product	\N	{"product_name": "Chicken Bowl"}	mobile	2025-12-10 15:45:44.987158+00
844e4a89-aa12-44e9-bbff-7fab680b8877	\N	checkout_started	order	\N	{"items_count": 2}	mobile	2025-12-10 15:45:44.987158+00
66df504b-596a-48ea-981f-fa0e5bb01370	\N	payment_initiated	payment	\N	{"method": "upi"}	mobile	2025-12-10 15:45:44.987158+00
c761d6c9-e554-4dd7-940a-cff6548db616	\N	order_placed	order	\N	{"order_value": 350}	mobile	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, name, description, image, rating, delivery_time, minimum_order, delivery_fee, cuisine_type, address, phone, is_active, is_featured, opening_hours, tags, created_at, updated_at, logo, banner_url, total_orders, total_reviews, whatsapp_number, email, is_open, is_verified, gst_number, fssai_license, bank_account, commission_rate, payout_frequency, status, latitude, longitude) FROM stdin;
550e8400-e29b-41d4-a716-446655440010	The Fruit Bowl Co	Fresh, organic fruit bowls and smoothies made with locally sourced ingredients	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	4.8	20-25 mins	199.00	0.00	Healthy Bowls	RS Puram, Coimbatore	+91 98765 43210	t	t	\N	{"Vegan Friendly",Organic,"Quick Delivery"}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.001811	76.962845
550e8400-e29b-41d4-a716-446655440011	Green Leaf Salads	Artisanal salads with premium greens and house-made dressings	https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop	4.7	25-30 mins	249.00	0.00	Salads & Greens	Gandhipuram, Coimbatore	+91 98765 43211	t	t	\N	{"Keto Friendly","Gluten Free","Fresh Daily"}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.0168	76.9558
550e8400-e29b-41d4-a716-446655440012	Smoothie Haven	Cold-pressed juices and protein smoothies for health enthusiasts	https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop	4.6	15-20 mins	149.00	0.00	Beverages	Peelamedu, Coimbatore	+91 98765 43212	t	t	\N	{"Protein Rich",Natural,"Energy Boost"}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.0200	76.9900
550e8400-e29b-41d4-a716-446655440013	Wholesome Kitchen	Complete meal solutions with balanced nutrition and taste	https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop	4.9	30-35 mins	299.00	0.00	Balanced Meals	Saibaba Colony, Coimbatore	+91 98765 43213	t	f	\N	{"Balanced Nutrition","High Protein","Family Meals"}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.0267	76.9452
550e8400-e29b-41d4-a716-446655440014	Pure Greens Cafe	Farm-to-table organic meals with sustainable practices	https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop	4.5	25-30 mins	199.00	0.00	Organic Cafe	Race Course, Coimbatore	+91 98765 43214	t	f	\N	{Organic,Sustainable,"Farm Fresh"}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.0025	76.9740
550e8400-e29b-41d4-a716-446655440015	Nutri Bowl Express	Quick healthy bowls for busy professionals	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	4.4	18-22 mins	179.00	0.00	Quick Bowls	Singanallur, Coimbatore	+91 98765 43215	t	f	\N	{"Quick Service","Office Friendly",Nutritious}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	10.9984	76.9996
550e8400-e29b-41d4-a716-446655440016	Detox & Delight	Cleansing juices and detox meal plans	https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop	4.3	20-25 mins	229.00	0.00	Detox Specialists	Vadavalli, Coimbatore	+91 98765 43216	t	f	\N	{Detox,Cleansing,Wellness}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.0125	76.9015
550e8400-e29b-41d4-a716-446655440017	Protein Power House	High-protein meals for fitness enthusiasts	https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop	4.6	25-30 mins	249.00	0.00	Fitness Meals	Hopes College, Coimbatore	+91 98765 43217	t	f	\N	{"High Protein",Fitness,"Muscle Building"}	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	0	0	\N	\N	t	f	\N	\N	\N	15.00	weekly	approved	11.0260	77.0120
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, vendor_id, name, description, price, image_url, category, tags, is_available, preparation_time, nutritional_info, ingredients, allergens, portion_size, spice_level, is_featured, sort_order, created_at, updated_at, thumbnail, gallery_images, video_url, type, discount_price, discount_percent, is_bestseller, calories, serves, stock_quantity, max_order_qty, min_order_qty, available_days) FROM stdin;
650e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440010	Tropical Paradise Bowl	A refreshing mix of mango, pineapple, kiwi, and passion fruit topped with coconut flakes and chia seeds	189.00	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	Bowls	{Vegan,Gluten-Free,High-Fiber}	t	8	{"fat": 3, "carbs": 65, "fiber": 8, "protein": 4, "calories": 280}	{Mango,Pineapple,Kiwi,"Passion Fruit","Coconut Flakes","Chia Seeds"}	{None}	Regular	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	219.00	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	Bowls	{High-Protein,Probiotic}	t	10	{"fat": 8, "carbs": 45, "fiber": 6, "protein": 18, "calories": 320}	{"Mixed Berries","Greek Yogurt",Granola,Honey}	{Dairy,Nuts}	Regular	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-14 12:01:27.001818+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440003	550e8400-e29b-41d4-a716-446655440010	Green Goddess Smoothie	Spinach, banana, apple, and spirulina power smoothie	159.00	https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop	Smoothies	{Vegan,Detox,Iron-Rich}	t	5	{"fat": 2, "carbs": 42, "fiber": 7, "protein": 6, "calories": 210}	{Spinach,Banana,Apple,Spirulina,"Coconut Water"}	{None}	Large	None	f	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440004	550e8400-e29b-41d4-a716-446655440010	Citrus Energy Boost	Orange, grapefruit, and ginger juice blend	129.00	https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop	Beverages	{"Vitamin C","Energy Boost",Natural}	t	5	{"fat": 0, "carbs": 28, "fiber": 2, "protein": 2, "calories": 120}	{Orange,Grapefruit,Ginger,Mint}	{None}	Regular	None	f	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440005	550e8400-e29b-41d4-a716-446655440011	Caesar Supreme Salad	Crisp romaine lettuce with parmesan, croutons, and classic caesar dressing	249.00	https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop	Salads	{Keto-Friendly,High-Protein}	t	12	{"fat": 28, "carbs": 12, "fiber": 4, "protein": 22, "calories": 380}	{"Romaine Lettuce","Parmesan Cheese",Croutons,"Caesar Dressing","Chicken Breast"}	{Dairy,Gluten,Eggs}	Large	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440006	550e8400-e29b-41d4-a716-446655440011	Mediterranean Delight	Mixed greens with feta, olives, tomatoes, and olive oil dressing	279.00	https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop	Salads	{Mediterranean,Gluten-Free}	t	15	{"fat": 26, "carbs": 18, "fiber": 6, "protein": 12, "calories": 350}	{"Mixed Greens","Feta Cheese","Kalamata Olives","Cherry Tomatoes",Cucumber,"Red Onion","Olive Oil"}	{Dairy}	Large	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440007	550e8400-e29b-41d4-a716-446655440011	Quinoa Power Salad	Nutrient-dense quinoa with roasted vegetables and tahini dressing	299.00	https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=400&h=300&fit=crop	Salads	{Vegan,High-Protein,Superfood}	t	18	{"fat": 15, "carbs": 55, "fiber": 8, "protein": 16, "calories": 420}	{Quinoa,"Roasted Sweet Potato","Bell Peppers",Chickpeas,Spinach,Tahini,Lemon}	{Sesame}	Large	None	f	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440011	550e8400-e29b-41d4-a716-446655440013	Balanced Buddha Bowl	Brown rice, grilled chicken, roasted vegetables, and tahini sauce	329.00	https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop	Bowls	{Balanced,High-Protein,"Complete Meal"}	t	20	{"fat": 22, "carbs": 48, "fiber": 8, "protein": 35, "calories": 520}	{"Brown Rice","Grilled Chicken",Broccoli,"Sweet Potato",Tahini,Spinach}	{Sesame}	Large	Mild	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440012	550e8400-e29b-41d4-a716-446655440013	Vegan Protein Bowl	Quinoa, black beans, avocado, and hemp seeds	289.00	https://images.unsplash.com/photo-1511909525232-61113c912358?w=400&h=300&fit=crop	Bowls	{Vegan,High-Protein,Plant-Based}	t	18	{"fat": 18, "carbs": 62, "fiber": 12, "protein": 22, "calories": 480}	{Quinoa,"Black Beans",Avocado,"Hemp Seeds","Bell Peppers",Lime}	{None}	Large	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440013	550e8400-e29b-41d4-a716-446655440013	Keto-Friendly Bowl	Cauliflower rice, grilled salmon, and avocado	369.00	https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop	Bowls	{Keto,Low-Carb,High-Fat}	t	22	{"fat": 32, "carbs": 8, "fiber": 6, "protein": 32, "calories": 450}	{"Cauliflower Rice","Grilled Salmon",Avocado,Spinach,"Olive Oil"}	{Fish}	Large	None	f	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440014	550e8400-e29b-41d4-a716-446655440014	Organic Garden Salad	Farm-fresh organic greens with seasonal vegetables	229.00	https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop	Salads	{Organic,Seasonal,Farm-Fresh}	t	12	{"fat": 6, "carbs": 24, "fiber": 8, "protein": 8, "calories": 180}	{"Organic Mixed Greens","Seasonal Vegetables","Organic Dressing"}	{None}	Regular	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440015	550e8400-e29b-41d4-a716-446655440014	Herbal Wellness Tea	Organic herbal tea blend for wellness	89.00	https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop	Beverages	{Organic,Wellness,Caffeine-Free}	t	5	{"fat": 0, "carbs": 1, "fiber": 0, "protein": 0, "calories": 5}	{"Organic Herbs",Chamomile,Mint}	{None}	Regular	None	f	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440016	550e8400-e29b-41d4-a716-446655440015	Express Chicken Bowl	Quick grilled chicken with rice and vegetables	199.00	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	Bowls	{Quick,High-Protein,Office-Friendly}	t	10	{"fat": 12, "carbs": 45, "fiber": 4, "protein": 30, "calories": 420}	{"Grilled Chicken","Jasmine Rice","Mixed Vegetables"}	{None}	Regular	Mild	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440017	550e8400-e29b-41d4-a716-446655440016	Detox Green Juice	Cleansing green vegetable juice	159.00	https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop	Beverages	{Detox,Cleansing,Cold-Pressed}	t	8	{"fat": 0, "carbs": 18, "fiber": 4, "protein": 4, "calories": 90}	{Kale,Spinach,Cucumber,Parsley,Lemon}	{None}	Regular	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440018	550e8400-e29b-41d4-a716-446655440017	Muscle Builder Bowl	High-protein bowl for fitness enthusiasts	319.00	https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop	Bowls	{High-Protein,Fitness,Muscle-Building}	t	15	{"fat": 20, "carbs": 50, "fiber": 6, "protein": 45, "calories": 600}	{"Chicken Breast","Brown Rice",Broccoli,"Sweet Potato","Protein Sauce"}	{Dairy}	Large	None	t	0	2025-09-13 20:16:24.304145+00	2025-09-13 20:16:24.304145+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440008	550e8400-e29b-41d4-a716-446655440012	Protein Power Smoothie	Banana, peanut butter, protein powder, and almond milk blend	200.00	https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop	Smoothies	{High-Protein,Post-Workout}	t	7	{"fat": 14, "carbs": 35, "fiber": 5, "protein": 28, "calories": 390}	{Banana,"Peanut Butter","Whey Protein","Almond Milk",Honey}	{Nuts,Dairy}	Large	None	t	0	2025-09-13 20:16:24.304145+00	2025-10-04 22:44:23.144889+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440010	550e8400-e29b-41d4-a716-446655440012	Cold Pressed Green Juice	Kale, celery, cucumber, apple, and lemon juice	150.00	https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop	Beverages	{Detox,Cold-Pressed,"Vitamin Rich"}	t	8	{"fat": 1, "carbs": 38, "fiber": 6, "protein": 6, "calories": 180}	{Kale,Celery,Cucumber,"Green Apple",Lemon,Ginger}	{None}	Regular	None	f	0	2025-09-13 20:16:24.304145+00	2025-10-04 22:44:32.403597+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
650e8400-e29b-41d4-a716-446655440009	550e8400-e29b-41d4-a716-446655440012	Antioxidant Berry Blast	Mixed berries with acai and coconut water	199.00	https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop	Smoothies	{Antioxidant,Vegan,Superfood}	t	6	{"fat": 3, "carbs": 48, "fiber": 8, "protein": 4, "calories": 220}	{Blueberries,Strawberries,"Acai Powder","Coconut Water","Chia Seeds"}	{None}	Regular	None	t	0	2025-09-13 20:16:24.304145+00	2025-11-18 09:36:47.909729+00	\N	\N	\N	veg	\N	\N	f	\N	1	\N	10	1	\N
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, user_phone, product_id, vendor_id, quantity, created_at, updated_at) FROM stdin;
750377ae-6b26-4a40-98da-ad95b86eefb8	+919599089361	650e8400-e29b-41d4-a716-446655440014	550e8400-e29b-41d4-a716-446655440014	1	2025-11-21 10:36:02.180951+00	2025-11-21 10:36:02.180951+00
ab7cbadd-542f-4618-9bf4-2f444af7f8db	+919629888617	650e8400-e29b-41d4-a716-446655440006	550e8400-e29b-41d4-a716-446655440011	1	2025-11-23 08:04:42.866524+00	2025-11-23 08:04:42.866524+00
53e75c51-0ad4-412f-acd2-9cd7969109a2	+919629888617	650e8400-e29b-41d4-a716-446655440005	550e8400-e29b-41d4-a716-446655440011	1	2025-11-23 08:04:42.866524+00	2025-11-23 08:04:42.866524+00
08df4863-96b2-454a-a500-2215c8e628d0	+919629888617	650e8400-e29b-41d4-a716-446655440007	550e8400-e29b-41d4-a716-446655440011	1	2025-11-23 08:04:42.866524+00	2025-11-23 08:04:42.866524+00
bff4e36d-380b-4953-88c0-416883ce3286	+919790312308	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	1	2025-11-23 19:16:31.81986+00	2025-11-23 19:16:31.81986+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, image_url, icon_name, sort_order, is_active, created_at, banner_url, parent_category_id, slug, is_featured) FROM stdin;
550e8400-e29b-41d4-a716-446655440001	Salads	Fresh and healthy salad options	\N	Salad	1	t	2025-09-13 20:16:24.304145+00	\N	\N	\N	f
550e8400-e29b-41d4-a716-446655440002	Bowls	Nutritious bowl meals	\N	Bowl	2	t	2025-09-13 20:16:24.304145+00	\N	\N	\N	f
550e8400-e29b-41d4-a716-446655440003	Beverages	Healthy drinks and juices	\N	Coffee	3	t	2025-09-13 20:16:24.304145+00	\N	\N	\N	f
550e8400-e29b-41d4-a716-446655440004	Snacks	Light and healthy snacks	\N	Cookie	4	t	2025-09-13 20:16:24.304145+00	\N	\N	\N	f
550e8400-e29b-41d4-a716-446655440005	Desserts	Guilt-free healthy desserts	\N	IceCream	5	t	2025-09-13 20:16:24.304145+00	\N	\N	\N	f
550e8400-e29b-41d4-a716-446655440006	Smoothies	Fresh fruit and vegetable smoothies	\N	Grape	6	t	2025-09-13 20:16:24.304145+00	\N	\N	\N	f
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.coupons (id, code, name, description, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, usage_per_user, used_count, valid_from, valid_until, is_active, vendor_id, applicable_categories, first_order_only, created_at) FROM stdin;
6ecf2b57-208f-4114-b709-a3f8d3e0e1da	WELCOME50	Welcome Offer	50% off on first order	percentage	50.00	200.00	150.00	\N	1	0	2025-12-10	\N	t	\N	\N	t	2025-12-10 14:47:03.502683+00
d4bf592a-12f8-4d51-ad7e-4b093ca72fd7	HEALTHY20	Healthy Discount	Flat ₹20 off	fixed	20.00	100.00	\N	\N	1	0	2025-12-10	\N	t	\N	\N	f	2025-12-10 14:47:03.502683+00
03c3de91-8dcf-4fe7-ac77-e1806eac5985	PROTEIN30	Protein Pack	30% off on protein meals	percentage	30.00	300.00	100.00	\N	1	0	2025-12-10	\N	t	\N	\N	f	2025-12-10 14:47:03.502683+00
c1000002-0000-4000-8000-000000000002	FLAT100	Flat 100 Off	Flat 100 off on orders above 500	fixed	100.00	500.00	\N	500	1	0	2025-12-10	2025-12-31	t	\N	\N	f	2025-12-10 15:45:44.987158+00
c1000005-0000-4000-8000-000000000005	FREESHIP	Free Delivery	Free delivery on orders above 250	fixed	30.00	250.00	\N	\N	1	0	2025-12-10	2025-12-31	t	\N	\N	f	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, vendor_id, order_number, status, order_type, subtotal, delivery_fee, packaging_fee, taxes, discount_amount, total_amount, delivery_address, delivery_phone, estimated_delivery_time, actual_delivery_time, payment_id, payment_method, payment_status, special_instructions, created_at, updated_at, platform_fee, gst_items, gst_fees, rider_id, tip_amount, delivery_otp, cancelled_by, cancellation_reason, refund_status, refund_amount, rating, feedback, feedback_at, invoice_number, invoice_url, order_source, device_type) FROM stdin;
cacdde6a-c8a8-4d25-b7e1-55cd13d6e03d	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1761076667814	confirmed	instant	219.00	50.00	5.00	19.58	0.00	279.00	{}	\N	\N	\N	OM2510220127482086300673	phonepe	paid	\N	2025-10-21 19:58:06.116+00	2025-10-21 19:58:06.116+00	10	10.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
5ba811e7-a30a-4f4f-8a64-1b684e6130e2	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440012	ORD_1761077367274	confirmed	instant	352.00	50.00	5.00	25.91	0.00	412.00	{}	\N	\N	\N	OM2510220139278146300225	phonepe	paid	\N	2025-10-21 20:10:00.986+00	2025-10-21 20:10:00.986+00	10	16.76	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
0670e4a3-216a-4ded-8803-699b92f1ca62	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1761077575365	confirmed	instant	189.00	50.00	5.00	18.15	0.00	249.00	{}	\N	\N	\N	OM2510220142558966300413	phonepe	paid	\N	2025-10-21 20:13:25.516+00	2025-10-21 20:13:25.516+00	10	9	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
02a39a10-9c0f-4c23-9436-24632356a206	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1761077669443	confirmed	instant	408.00	50.00	5.00	28.58	0.00	468.00	{}	\N	\N	\N	OM2510220144303396300853	phonepe	paid	\N	2025-10-21 20:14:48.966+00	2025-10-21 20:14:48.966+00	10	19.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
6bf571c3-636c-4f6d-a414-2d2eb792864d	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1761077770839	confirmed	instant	408.00	50.00	5.00	28.58	0.00	468.00	{}	\N	\N	\N	OM2510220146119656300168	phonepe	paid	\N	2025-10-21 20:16:30.033+00	2025-10-21 20:16:30.033+00	10	19.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
6f64822a-0885-43bb-a05a-66cbad268669	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1761381100033	confirmed	instant	219.00	50.00	5.00	19.58	0.00	279.00	{}	\N	\N	\N	OM2510251401403710326606	phonepe	paid	\N	2025-10-25 08:31:59.158+00	2025-10-25 08:31:59.158+00	10	10.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
33b43327-3cb8-445f-bce4-59504c4d7090	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1762073432545	confirmed	instant	1005.00	50.00	5.00	57.01	0.00	1065.00	{}	\N	\N	\N	OM2511021420343273851306	phonepe	paid	\N	2025-11-02 08:50:57.254+00	2025-11-02 08:50:57.254+00	10	47.86	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
8e751dbd-44ad-4824-b379-99ea4dfa8972	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1762076901774	confirmed	instant	219.00	50.00	5.00	19.58	0.00	279.00	{}	\N	\N	\N	OM2511021518223453851983	phonepe	paid	\N	2025-11-02 09:48:46.492+00	2025-11-02 09:48:46.492+00	10	10.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
4cbfd5b5-912b-4707-970b-479e2e035698	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1762090620587	confirmed	instant	408.00	50.00	5.00	28.58	0.00	468.00	{}	\N	\N	\N	OM2511021907025243195536	phonepe	paid	\N	2025-11-02 13:37:25.666+00	2025-11-02 13:37:25.666+00	10	19.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
e55251c3-6022-47c5-a2fd-d004fd7349ee	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440011	ORD_1762105960454	confirmed	instant	837.00	50.00	5.00	49.01	0.00	897.00	{}	\N	\N	\N	OM2511022322422333851114	phonepe	paid	\N	2025-11-02 17:53:17.403+00	2025-11-02 17:53:17.403+00	10	39.86	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
e39b3198-ce1d-44e3-b998-795485fa249c	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	ORD_1762716443127	confirmed	instant	219.00	50.00	5.00	19.58	0.00	279.00	{}	\N	\N	\N	OM2511100057248212938496	phonepe	paid	\N	2025-11-09 19:27:51.124+00	2025-11-09 19:27:51.124+00	10	10.43	9.15	\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	app	\N
\.


--
-- Data for Name: coupon_usage; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.coupon_usage (id, coupon_id, user_id, order_id, discount_applied, used_at) FROM stdin;
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.delivery_zones (id, name, city, state, center_lat, center_lng, radius_km, polygon, is_active, created_at) FROM stdin;
8aa47b1b-de10-42a9-9197-3bf7430e6988	RS Puram	Coimbatore	Tamil Nadu	11.01680000	76.95580000	3.00	\N	t	2025-12-10 14:46:26.223814+00
bedb638f-482a-4691-b515-bc833a93e10b	Gandhipuram	Coimbatore	Tamil Nadu	11.01780000	76.96740000	2.50	\N	t	2025-12-10 14:46:26.223814+00
2d6d3079-2bad-4584-bcdf-c1de42740dcb	Peelamedu	Coimbatore	Tamil Nadu	11.02840000	77.00540000	3.00	\N	t	2025-12-10 14:46:26.223814+00
f9de5e8c-8885-40fb-9944-4f83d18df731	Saibaba Colony	Coimbatore	Tamil Nadu	11.02870000	76.95160000	2.00	\N	t	2025-12-10 14:46:26.223814+00
b558fbf4-6461-459f-a7fe-332b961629a4	Race Course	Coimbatore	Tamil Nadu	11.01360000	76.96290000	2.50	\N	t	2025-12-10 14:46:26.223814+00
036cb44a-15a3-4109-9eae-a19b8dca751f	Singanallur	Coimbatore	Tamil Nadu	10.99720000	77.03530000	3.50	\N	t	2025-12-10 14:46:26.223814+00
d1000001-0000-4000-8000-000000000001	RS Puram	Coimbatore	Tamil Nadu	11.01680000	76.95580000	3.00	\N	t	2025-12-10 15:45:44.987158+00
d1000002-0000-4000-8000-000000000002	Gandhipuram	Coimbatore	Tamil Nadu	11.01780000	76.96740000	2.50	\N	t	2025-12-10 15:45:44.987158+00
d1000003-0000-4000-8000-000000000003	Peelamedu	Coimbatore	Tamil Nadu	11.02840000	77.00540000	3.00	\N	t	2025-12-10 15:45:44.987158+00
d1000004-0000-4000-8000-000000000004	Saibaba Colony	Coimbatore	Tamil Nadu	11.02870000	76.95160000	2.00	\N	t	2025-12-10 15:45:44.987158+00
d1000005-0000-4000-8000-000000000005	Race Course	Coimbatore	Tamil Nadu	11.01360000	76.96290000	2.50	\N	t	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.inventory_logs (id, product_id, vendor_id, change_type, quantity_change, quantity_before, quantity_after, reason, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: kv_store_6985f4e9; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kv_store_6985f4e9 (key, value) FROM stdin;
\.


--
-- Data for Name: meal_plans; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.meal_plans (id, vendor_id, title, description, thumbnail, banner_url, video_url, price_display, price_per_day, price_per_week, trial_price, schedule, features, plan_type, dietary_type, calories_per_day, includes_breakfast, includes_lunch, includes_dinner, includes_snacks, rating, review_count, min_duration_days, max_duration_days, terms_conditions, is_active, is_featured, sort_order, created_at, updated_at) FROM stdin;
1187d0f8-0a0c-4c11-ad73-5f8bd2d70cc7	\N	Protein Power	\N	\N	\N	\N	₹89/day	89.00	\N	\N	Mon – Sat · Lunch/Dinner	{"Curated, chef-cooked dishes","Daily menu variety","Free delivery on every order"}	\N	non-veg	\N	f	t	t	f	4.6	0	7	90	\N	t	t	1	2025-12-10 14:47:17.436116+00	2025-12-10 14:47:17.436116+00
7e50fd22-66a3-414c-b6cb-9b48feabb80a	\N	Balanced Meal	\N	\N	\N	\N	₹89/day	89.00	\N	\N	Mon – Sat · Lunch/Dinner	{"Curated, chef-cooked dishes","Daily menu variety","Free delivery on every order"}	\N	veg	\N	f	t	t	f	4.8	0	7	90	\N	t	t	2	2025-12-10 14:47:17.436116+00	2025-12-10 14:47:17.436116+00
61456755-7106-4405-a44a-a6642ab6bfa8	\N	Veggie Delight	\N	\N	\N	\N	₹85/day	85.00	\N	\N	Mon – Sat · Lunch/Dinner	{"Fresh vegetarian dishes","Daily menu variety","Free delivery on every order"}	\N	veg	\N	f	t	t	f	4.5	0	7	90	\N	t	f	3	2025-12-10 14:47:17.436116+00	2025-12-10 14:47:17.436116+00
705d3ef7-9ac9-47c5-9f2a-14bacd5324bf	\N	Keto Power	\N	\N	\N	\N	₹99/day	99.00	\N	\N	Mon – Sat · Lunch/Dinner	{"Low carb meals","High protein","Free delivery"}	\N	non-veg	\N	f	t	t	f	4.7	0	7	90	\N	t	f	4	2025-12-10 14:47:17.436116+00	2025-12-10 14:47:17.436116+00
a1000001-0000-4000-8000-000000000001	\N	Protein Power	High protein meals for fitness enthusiasts	/assets/mealplans/proteinpower.png	\N	\N	89/day	89.00	534.00	299.00	Mon to Sat Lunch Dinner	{"Curated chef-cooked dishes","Daily menu variety","Free delivery on every order","30g+ protein per meal"}	muscle_gain	non-veg	\N	f	t	t	f	4.6	0	7	90	\N	t	t	1	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
a1000002-0000-4000-8000-000000000002	\N	Balanced Meal	Perfectly balanced nutrition for daily wellness	/assets/mealplans/balanced.png	\N	\N	89/day	89.00	534.00	299.00	Mon to Sat Lunch Dinner	{"Curated chef-cooked dishes","Daily menu variety","Free delivery on every order","Balanced macros"}	balanced	veg	\N	f	t	t	f	4.8	0	7	90	\N	t	t	2	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
a1000003-0000-4000-8000-000000000003	\N	Veggie Delight	Fresh vegetarian meals with seasonal produce	/assets/mealplans/veggiedelight.png	\N	\N	85/day	85.00	510.00	279.00	Mon to Sat Lunch Dinner	{"100% vegetarian","Fresh ingredients","Free delivery","Low oil cooking"}	balanced	veg	\N	f	t	t	f	4.5	0	7	90	\N	t	f	3	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
a1000004-0000-4000-8000-000000000004	\N	Keto Power	Low carb high fat ketogenic meals	/assets/mealplans/keto.png	\N	\N	99/day	99.00	594.00	349.00	Mon to Sat Lunch Dinner	{"Under 20g carbs","High healthy fats","Keto-friendly ingredients","No sugar added"}	keto	non-veg	\N	f	t	t	f	4.7	0	7	90	\N	t	f	4	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
a1000005-0000-4000-8000-000000000005	\N	Weight Loss	Calorie-controlled meals for weight management	/assets/mealplans/weightloss.png	\N	\N	95/day	95.00	570.00	329.00	Mon to Sat Lunch Dinner	{"500-600 cal per meal","High fiber","Portion controlled","Nutritionist approved"}	weight_loss	veg	\N	f	t	t	f	4.4	0	7	90	\N	t	t	5	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: meal_plan_day_menu; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, day_theme, breakfast_product_id, breakfast_image, lunch_product_id, lunch_image, dinner_product_id, dinner_image, snack_product_id, snack_image, total_calories, notes, created_at) FROM stdin;
9a53dd05-bce1-465a-b316-09d83a1fcf68	a1000001-0000-4000-8000-000000000001	0	Sunday	Rest Day Special	\N	\N	\N	\N	\N	\N	\N	\N	1200	\N	2025-12-10 15:45:44.987158+00
caf0b4f5-6f65-4963-9cd1-606202089d72	a1000001-0000-4000-8000-000000000001	1	Monday	Muscle Monday	\N	\N	\N	\N	\N	\N	\N	\N	1400	\N	2025-12-10 15:45:44.987158+00
60dd2849-4d88-4fc0-bd72-8ef58c341c46	a1000001-0000-4000-8000-000000000001	2	Tuesday	Protein Tuesday	\N	\N	\N	\N	\N	\N	\N	\N	1350	\N	2025-12-10 15:45:44.987158+00
e5de5bd9-cfa3-4d21-9538-f35a94c5e2f1	a1000001-0000-4000-8000-000000000001	3	Wednesday	Wellness Wednesday	\N	\N	\N	\N	\N	\N	\N	\N	1300	\N	2025-12-10 15:45:44.987158+00
5e48cbcb-a087-4ed6-88d0-5a45229eec2b	a1000001-0000-4000-8000-000000000001	4	Thursday	Thriving Thursday	\N	\N	\N	\N	\N	\N	\N	\N	1400	\N	2025-12-10 15:45:44.987158+00
c196bf4e-61c9-4664-97c4-a73dd42a03bf	a1000001-0000-4000-8000-000000000001	5	Friday	Fitness Friday	\N	\N	\N	\N	\N	\N	\N	\N	1350	\N	2025-12-10 15:45:44.987158+00
a958ef2e-d179-413f-88e0-3170f02041ea	a1000001-0000-4000-8000-000000000001	6	Saturday	Strong Saturday	\N	\N	\N	\N	\N	\N	\N	\N	1400	\N	2025-12-10 15:45:44.987158+00
5bb5fba5-4672-4301-9b36-98175a6aeb0a	a1000002-0000-4000-8000-000000000002	1	Monday	Fresh Start	\N	\N	\N	\N	\N	\N	\N	\N	1100	\N	2025-12-10 15:45:44.987158+00
da849c0c-cffb-443a-b8e4-504e6aae70a5	a1000002-0000-4000-8000-000000000002	2	Tuesday	Energy Boost	\N	\N	\N	\N	\N	\N	\N	\N	1150	\N	2025-12-10 15:45:44.987158+00
3818d1ae-122e-4c3c-b939-179aa9e47410	a1000002-0000-4000-8000-000000000002	3	Wednesday	Mid-week Balance	\N	\N	\N	\N	\N	\N	\N	\N	1100	\N	2025-12-10 15:45:44.987158+00
5a672c93-fd13-4e36-bb1a-444612ceb78e	a1000002-0000-4000-8000-000000000002	4	Thursday	Nourish Day	\N	\N	\N	\N	\N	\N	\N	\N	1150	\N	2025-12-10 15:45:44.987158+00
dbc4f70a-1826-4e19-b407-9665bf8ac9a8	a1000002-0000-4000-8000-000000000002	5	Friday	Vitality Friday	\N	\N	\N	\N	\N	\N	\N	\N	1100	\N	2025-12-10 15:45:44.987158+00
eff63c30-1003-47e8-93c7-669b1ebf34e4	a1000002-0000-4000-8000-000000000002	6	Saturday	Weekend Wellness	\N	\N	\N	\N	\N	\N	\N	\N	1200	\N	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: meal_plan_subscriptions; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.meal_plan_subscriptions (id, user_id, meal_plan_id, chosen_meals, chosen_days, custom_times, duration, start_date, end_date, total_amount, delivery_address, status, payment_id, payment_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.notification_preferences (id, user_id, order_updates, subscription_alerts, promotional, review_requests, channel, updated_at) FROM stdin;
262c4e87-4ae4-462a-b993-8d196dbfb9aa	e0d398e9-4cca-43f5-b861-12df13599056	t	t	t	t	push	2025-12-10 15:45:44.987158+00
ba89f850-11e7-4650-9030-92a7cf5945d1	2717762d-f1f3-4099-8333-a03acbf828b2	t	t	t	t	push	2025-12-10 15:45:44.987158+00
b8fa472e-26c3-42ce-8fe9-6e89efecbfcc	b59be4e6-cc63-4f38-895f-c73e813f973c	t	t	t	t	push	2025-12-10 15:45:44.987158+00
004b068f-e249-4698-b588-588c2bef98b2	0c245f14-d001-421d-bb34-1f76287d139a	t	t	t	t	push	2025-12-10 15:45:44.987158+00
3ed74da8-67f7-4cff-b8cb-8b9940b45151	55187d8f-8261-4283-9a39-15f8d5890d34	t	t	t	t	push	2025-12-10 15:45:44.987158+00
40e47d21-3bac-49c5-a39e-decf87608ef9	91855c2c-4b22-449a-8eaf-b2eb0196054b	t	t	t	t	push	2025-12-10 15:45:44.987158+00
0844aa39-ea93-4b60-9875-7962fc9df808	103406e8-80d7-43b4-a127-1bef9a4e29dd	t	t	t	t	push	2025-12-10 15:45:44.987158+00
9fae34d8-4383-4d45-99d4-675c84c09823	f4cc81c0-3c55-4a03-9f6c-05b7bcd37d6c	t	t	t	t	push	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.notifications (id, user_id, type, title, message, data, is_read, read_at, created_at) FROM stdin;
ff2a5ac9-7fe0-40ea-8e62-db0aec4bed0e	e0d398e9-4cca-43f5-b861-12df13599056	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
c6fe310c-c58d-43eb-9db1-47c9be3d1e09	2717762d-f1f3-4099-8333-a03acbf828b2	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
aa63307e-dc21-4fc5-a708-d160704fe305	b59be4e6-cc63-4f38-895f-c73e813f973c	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
302edcaf-9163-43d9-bf07-bccc7f585eef	0c245f14-d001-421d-bb34-1f76287d139a	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
5d95625c-4aeb-4f27-bec0-dc890c008561	55187d8f-8261-4283-9a39-15f8d5890d34	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
85b71fcd-b839-4750-8bba-2e4f61c1e830	91855c2c-4b22-449a-8eaf-b2eb0196054b	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
61fd2656-0bf0-41b3-8009-dc7b2799f31c	103406e8-80d7-43b4-a127-1bef9a4e29dd	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
12664cdd-4c49-4411-9245-ff7b84034e48	f4cc81c0-3c55-4a03-9f6c-05b7bcd37d6c	promo	Welcome to Gutzo!	Thanks for joining! Use code WELCOME50 for 50% off on your first order.	{"coupon_code": "WELCOME50"}	f	\N	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, vendor_id, product_name, product_description, product_image_url, quantity, unit_price, total_price, special_instructions, customizations, created_at) FROM stdin;
27c24241-dfab-4e01-9b81-0c8786b7cd05	cacdde6a-c8a8-4d25-b7e1-55cd13d6e03d	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-10-21 19:58:06.123+00
1947a0d8-519b-4cc6-9b3e-c6a469d5cadb	5ba811e7-a30a-4f4f-8a64-1b684e6130e2	650e8400-e29b-41d4-a716-446655440008	550e8400-e29b-41d4-a716-446655440012	Protein Power Smoothie	Banana, peanut butter, protein powder, and almond milk blend	https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop	1	200.00	200.00	\N	\N	2025-10-21 20:10:01.011+00
96d7feeb-9da6-4ffc-8aa9-1e62e51e2b67	5ba811e7-a30a-4f4f-8a64-1b684e6130e2	650e8400-e29b-41d4-a716-446655440009	550e8400-e29b-41d4-a716-446655440012	Antioxidant Berry Blast	Mixed berries with acai and coconut water	https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop	1	2.00	2.00	\N	\N	2025-10-21 20:10:01.011+00
490864d7-8c80-45bd-a93d-93fa590a052c	5ba811e7-a30a-4f4f-8a64-1b684e6130e2	650e8400-e29b-41d4-a716-446655440010	550e8400-e29b-41d4-a716-446655440012	Cold Pressed Green Juice	Kale, celery, cucumber, apple, and lemon juice	https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop	1	150.00	150.00	\N	\N	2025-10-21 20:10:01.011+00
8823f5ae-6428-49c9-bab6-410c1a2be2fb	0670e4a3-216a-4ded-8803-699b92f1ca62	650e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440010	Tropical Paradise Bowl	A refreshing mix of mango, pineapple, kiwi, and passion fruit topped with coconut flakes and chia seeds	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	1	189.00	189.00	\N	\N	2025-10-21 20:13:25.526+00
f7a1621b-7ed4-476f-9102-cee74f90bd33	02a39a10-9c0f-4c23-9436-24632356a206	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-10-21 20:14:48.974+00
52621f3d-308c-44f5-92b0-4d325d73aae0	02a39a10-9c0f-4c23-9436-24632356a206	650e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440010	Tropical Paradise Bowl	A refreshing mix of mango, pineapple, kiwi, and passion fruit topped with coconut flakes and chia seeds	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	1	189.00	189.00	\N	\N	2025-10-21 20:14:48.974+00
71e7333d-3e41-4d7d-81c8-4118014d0efe	6bf571c3-636c-4f6d-a414-2d2eb792864d	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-10-21 20:16:30.045+00
b80d5a4d-e743-4a02-8d35-e40afbdab01f	6bf571c3-636c-4f6d-a414-2d2eb792864d	650e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440010	Tropical Paradise Bowl	A refreshing mix of mango, pineapple, kiwi, and passion fruit topped with coconut flakes and chia seeds	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	1	189.00	189.00	\N	\N	2025-10-21 20:16:30.045+00
7ed8470f-a3b5-4746-b22a-11bc39bfd01f	6f64822a-0885-43bb-a05a-66cbad268669	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-10-25 08:31:59.174+00
d2535d25-1d96-43ff-bde2-b59b3e1e0170	33b43327-3cb8-445f-bce4-59504c4d7090	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	2	219.00	438.00	\N	\N	2025-11-02 08:50:57.264+00
533d0811-dc5b-4c0b-9e07-fd1b58ebfaa6	33b43327-3cb8-445f-bce4-59504c4d7090	650e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440010	Tropical Paradise Bowl	A refreshing mix of mango, pineapple, kiwi, and passion fruit topped with coconut flakes and chia seeds	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	3	189.00	567.00	\N	\N	2025-11-02 08:50:57.264+00
d3ac0833-6ef8-40d7-804c-12c3cec730d7	8e751dbd-44ad-4824-b379-99ea4dfa8972	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-11-02 09:48:46.503+00
f902905e-64b1-44fe-a05b-afa31bb1e3e9	4cbfd5b5-912b-4707-970b-479e2e035698	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-11-02 13:37:25.677+00
9f2fadc4-bdb6-4375-b557-a0e0c5ea5833	4cbfd5b5-912b-4707-970b-479e2e035698	650e8400-e29b-41d4-a716-446655440001	550e8400-e29b-41d4-a716-446655440010	Tropical Paradise Bowl	A refreshing mix of mango, pineapple, kiwi, and passion fruit topped with coconut flakes and chia seeds	https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop	1	189.00	189.00	\N	\N	2025-11-02 13:37:25.677+00
cc10a976-7660-4786-835c-222ee04c30eb	e55251c3-6022-47c5-a2fd-d004fd7349ee	650e8400-e29b-41d4-a716-446655440006	550e8400-e29b-41d4-a716-446655440011	Mediterranean Delight	Mixed greens with feta, olives, tomatoes, and olive oil dressing	https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop	3	279.00	837.00	\N	\N	2025-11-02 17:53:17.414+00
2fa17cb7-c125-440a-a90a-d14b206bc9d1	e39b3198-ce1d-44e3-b998-795485fa249c	650e8400-e29b-41d4-a716-446655440002	550e8400-e29b-41d4-a716-446655440010	Berry Protein Bowl	Mixed berries with Greek yogurt, granola, and honey drizzle	https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop	1	219.00	219.00	\N	\N	2025-11-09 19:27:51.134+00
\.


--
-- Data for Name: otp_verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otp_verification (id, phone, otp, expires_at, verified, attempts, created_at, verified_at) FROM stdin;
2754df45-b7f2-4ad2-9564-a3b2873b3c7f	+919043747310	328794	2025-09-19 07:06:23.987+00	t	0	2025-09-19 07:01:23.987+00	2025-09-19 07:01:43.892+00
66f05f7c-a308-4f20-98d4-f32a21388014	+917397725100	852618	2025-09-20 12:10:39.622+00	t	0	2025-09-20 12:05:39.623+00	2025-09-20 12:05:53.05+00
157a1e2c-3525-43ad-8d10-527a6ebdf856	+919876543210	627467	2025-12-10 15:54:22.707+00	f	0	2025-12-10 15:49:22.707+00	\N
e06b9bc9-1ea2-4d16-a1cb-e7b24662fd60	+919677100836	251291	2025-12-10 16:04:58.436+00	t	0	2025-12-10 15:59:58.436+00	2025-12-10 16:00:15.674+00
b5e159f8-a26c-4254-b5eb-e74fdbc467d2	+916381708229	848908	2025-11-14 05:57:04.692+00	f	0	2025-11-14 05:52:04.692+00	\N
c74ad43e-a765-44e9-bc49-1dc961c73e94	+919944751745	496481	2025-12-10 16:10:32.129+00	t	0	2025-12-10 16:05:32.129+00	2025-12-10 16:06:08.487+00
d01c5946-8ab1-4880-b57c-c4862e60aebc	+918754756486	945730	2025-11-21 06:33:58.259+00	t	0	2025-11-21 06:28:58.259+00	2025-11-21 06:29:23.976+00
9f4b00a4-776e-4585-939b-5c6602607bf7	+919599089361	403937	2025-11-21 10:40:39.806+00	t	0	2025-11-21 10:35:39.806+00	2025-11-21 10:35:57.209+00
9081e780-e17a-46b6-b24a-ae9a5e1aeee7	+919790312308	484450	2025-11-22 12:37:03.255+00	t	0	2025-11-22 12:32:03.255+00	2025-11-22 12:32:11.452+00
810f59c1-4560-4698-947b-463d0f20d27c	+919629888617	470986	2025-11-23 08:09:01.547+00	t	0	2025-11-23 08:04:01.548+00	2025-11-23 08:04:18.92+00
e0f81168-4c0a-401c-927f-18f26bbc564e	+919003802398	949068	2025-12-05 06:22:49.278+00	t	0	2025-12-05 06:17:49.279+00	2025-12-05 06:18:09.394+00
\.


--
-- Data for Name: product_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_subscriptions (id, user_id, vendor_id, subscription_name, frequency, duration_weeks, start_date, end_date, total_amount, amount_per_delivery, status, delivery_time, delivery_days, delivery_address, payment_id, payment_method, payment_status, created_at, updated_at, menu_ids, next_delivery_date, per_delivery_amount, auto_renew, pause_start_date, pause_end_date, pause_reason, skip_dates) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.payments (id, order_id, subscription_id, mode, gateway, transaction_id, merchant_order_id, amount, currency, status, gateway_response, refund_id, refunded_amount, refunded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_addons; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.product_addons (id, product_id, name, price, image, is_veg, max_quantity, is_available, sort_order, created_at) FROM stdin;
18f644f8-3de7-45f6-966b-e2260f4479b4	650e8400-e29b-41d4-a716-446655440001	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
04f06d46-e0c8-497d-bcca-2613dcac4a09	650e8400-e29b-41d4-a716-446655440002	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
479f4646-d39a-4d80-a07a-6f62cebce5f8	650e8400-e29b-41d4-a716-446655440003	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
25178ca5-fa76-45df-bb2a-4fbd838865cc	650e8400-e29b-41d4-a716-446655440004	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
39635327-a1c4-4b2c-84ae-54584e031436	650e8400-e29b-41d4-a716-446655440005	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
b5795df1-c230-4087-9ff8-737cfa6fc66b	650e8400-e29b-41d4-a716-446655440006	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
a86ee38e-4d73-4b7f-b86b-84b691c772ad	650e8400-e29b-41d4-a716-446655440007	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
9217e4c5-5842-46eb-b1a5-132ab7d68e82	650e8400-e29b-41d4-a716-446655440011	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
71f29abf-eb7d-44ee-b998-6d28084d3c03	650e8400-e29b-41d4-a716-446655440012	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
7a6e0145-5601-4e53-ab55-ccd9774adfc5	650e8400-e29b-41d4-a716-446655440013	Extra Cheese	25.00	\N	t	2	t	1	2025-12-10 15:45:44.987158+00
15dd6e37-c9fa-40b4-ab79-3ebd2aa2e427	650e8400-e29b-41d4-a716-446655440001	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
3c59d5d9-2b4e-49cd-95d8-f16e18191ea6	650e8400-e29b-41d4-a716-446655440002	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
7b0d09e1-784c-47b5-beb1-bce3231288e6	650e8400-e29b-41d4-a716-446655440003	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
491757d8-e84d-4b04-b441-ebf98cdf18b7	650e8400-e29b-41d4-a716-446655440004	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
eea3405d-3d2e-4400-af42-2d5d6d601fe7	650e8400-e29b-41d4-a716-446655440005	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
c540738b-4d9f-42d5-a3d5-eea0579bc45c	650e8400-e29b-41d4-a716-446655440006	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
bf3e9351-fc76-405e-842c-f9aaa2903208	650e8400-e29b-41d4-a716-446655440007	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
6342ecc9-af39-4420-8fff-5f481ddf7965	650e8400-e29b-41d4-a716-446655440011	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
227c4e0b-9cfd-40d4-b49b-503872a1379b	650e8400-e29b-41d4-a716-446655440012	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
2483d6c4-8d4d-4c6e-bd0a-b3304addb29a	650e8400-e29b-41d4-a716-446655440013	Extra Sauce	15.00	\N	t	3	t	2	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.product_variants (id, product_id, name, price, calories, image, is_default, is_available, sort_order, created_at) FROM stdin;
1337b041-9311-4f91-a961-96ee5d215028	650e8400-e29b-41d4-a716-446655440001	Regular	189.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
d8f1e881-d2d8-4acb-a2fe-5c86559b96b9	650e8400-e29b-41d4-a716-446655440002	Regular	219.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
6a679dd1-fc22-403d-b46a-104c26cea6d7	650e8400-e29b-41d4-a716-446655440003	Regular	159.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
3f971cd2-b394-4c35-ad9f-28ce161d8b69	650e8400-e29b-41d4-a716-446655440004	Regular	129.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
058d97e8-cf23-4067-a6ed-2f7db81d358f	650e8400-e29b-41d4-a716-446655440005	Regular	249.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
f3996a9d-09f3-46c9-a99f-9d7b053f0a4f	650e8400-e29b-41d4-a716-446655440006	Regular	279.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
6c514922-12ec-4357-9766-0426ed264cfe	650e8400-e29b-41d4-a716-446655440007	Regular	299.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
e5fd7d62-3a45-4e93-a291-6cb56f73f0a0	650e8400-e29b-41d4-a716-446655440011	Regular	329.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
aca392f2-e269-4b1c-9627-e6222a2bca35	650e8400-e29b-41d4-a716-446655440012	Regular	289.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
904e536f-15e9-4d15-b69a-e40c888d96d8	650e8400-e29b-41d4-a716-446655440013	Regular	369.00	\N	\N	t	t	1	2025-12-10 15:45:44.987158+00
769ffcce-6702-4bff-806f-140896cf3540	650e8400-e29b-41d4-a716-446655440001	Medium	219.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
7813e655-797b-4adc-a406-99164b954e24	650e8400-e29b-41d4-a716-446655440002	Medium	249.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
6893da5e-5dcb-4d17-a037-67587d337188	650e8400-e29b-41d4-a716-446655440003	Medium	189.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
fe612128-9a71-4118-8e7a-ab62e9ec4986	650e8400-e29b-41d4-a716-446655440004	Medium	159.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
45108228-fe9d-4bc2-a07b-e2acf8e09ccc	650e8400-e29b-41d4-a716-446655440005	Medium	279.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
2c25edf7-4b8a-42d4-9ac8-3e36d8a1a476	650e8400-e29b-41d4-a716-446655440006	Medium	309.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
59a6b049-521d-4db4-823a-29207320a5b1	650e8400-e29b-41d4-a716-446655440007	Medium	329.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
9cbd2ffb-5f00-4355-8afb-22530adc112f	650e8400-e29b-41d4-a716-446655440011	Medium	359.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
53509df8-f076-4cab-ba4f-41ce50e8bd85	650e8400-e29b-41d4-a716-446655440012	Medium	319.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
a8877ea4-2be8-4035-89b8-2c48107a6133	650e8400-e29b-41d4-a716-446655440013	Medium	399.00	\N	\N	f	t	2	2025-12-10 15:45:44.987158+00
3cad4bee-ad79-4e16-8182-06fd8c766a47	650e8400-e29b-41d4-a716-446655440001	Large	249.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
49c3269b-4b9b-440d-bf62-bb5d4fbce5c9	650e8400-e29b-41d4-a716-446655440002	Large	279.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
e8f179f6-f658-4931-a46b-86b44b7ffffc	650e8400-e29b-41d4-a716-446655440003	Large	219.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
328ab4f1-13f9-41fa-a339-d235024e0371	650e8400-e29b-41d4-a716-446655440004	Large	189.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
fd5b0316-1cb7-4933-a818-a2eb21e9b636	650e8400-e29b-41d4-a716-446655440005	Large	309.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
2a7c3e12-5896-4dcf-a096-ac39bcba4022	650e8400-e29b-41d4-a716-446655440006	Large	339.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
b2988be1-25de-4355-874a-1ca0362975f0	650e8400-e29b-41d4-a716-446655440007	Large	359.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
1df95fea-160a-44b4-a956-b1a0c579ce10	650e8400-e29b-41d4-a716-446655440011	Large	389.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
d7dd6bfd-1920-4198-a6a5-08cfb80a6194	650e8400-e29b-41d4-a716-446655440012	Large	349.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
7237877b-64be-4c75-9d4a-a478a3279e2f	650e8400-e29b-41d4-a716-446655440013	Large	429.00	\N	\N	f	t	3	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: promo_banners; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.promo_banners (id, title, subtitle, image_url, mobile_image_url, link_type, link_target_id, link_url, "position", sort_order, start_date, end_date, is_active, clicks, impressions, created_at) FROM stdin;
b1000001-0000-4000-8000-000000000001	Welcome to Gutzo!	Healthy food delivered fresh	/assets/banners/hero-welcome.png	/assets/banners/hero-welcome-mobile.png	url	\N	\N	hero	1	2025-12-10 15:45:44.987158+00	\N	t	0	0	2025-12-10 15:45:44.987158+00
b1000002-0000-4000-8000-000000000002	Protein Power Meals	Get 30g+ protein with every meal	/assets/banners/protein-power.png	/assets/banners/protein-power-mobile.png	meal_plan	\N	\N	hero	2	2025-12-10 15:45:44.987158+00	\N	t	0	0	2025-12-10 15:45:44.987158+00
b1000003-0000-4000-8000-000000000003	First Order 50% OFF	Use code WELCOME50	/assets/banners/first-order.png	/assets/banners/first-order-mobile.png	url	\N	\N	middle	1	2025-12-10 15:45:44.987158+00	\N	t	0	0	2025-12-10 15:45:44.987158+00
b1000004-0000-4000-8000-000000000004	Weekly Meal Plans	Subscribe and save more	/assets/banners/meal-plans.png	/assets/banners/meal-plans-mobile.png	meal_plan	\N	\N	middle	2	2025-12-10 15:45:44.987158+00	\N	t	0	0	2025-12-10 15:45:44.987158+00
b1000005-0000-4000-8000-000000000005	Free Delivery	On orders above 250	/assets/banners/free-delivery.png	/assets/banners/free-delivery-mobile.png	url	\N	\N	bottom	1	2025-12-10 15:45:44.987158+00	\N	t	0	0	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.referrals (id, referrer_id, referee_id, referral_code, status, referrer_reward, referee_reward, first_order_id, completed_at, expires_at, created_at) FROM stdin;
56e121d3-f861-4ded-a809-f4def18e8cf9	e0d398e9-4cca-43f5-b861-12df13599056	\N	REF8EDF54	pending	50.00	50.00	\N	\N	2026-01-09 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
c34a05bf-761a-4ef3-b629-4a4383bb61cc	2717762d-f1f3-4099-8333-a03acbf828b2	\N	REF9879B6	pending	50.00	50.00	\N	\N	2026-01-09 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
acbdd7ff-e305-42ca-9893-fda108144139	b59be4e6-cc63-4f38-895f-c73e813f973c	\N	REF2344FE	pending	50.00	50.00	\N	\N	2026-01-09 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
d598954f-886a-4e54-a46b-e945b6e08f66	0c245f14-d001-421d-bb34-1f76287d139a	\N	REF396F19	pending	50.00	50.00	\N	\N	2026-01-09 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
49073307-1883-4d7d-bf3a-25aecb16baf3	55187d8f-8261-4283-9a39-15f8d5890d34	\N	REF0EA215	pending	50.00	50.00	\N	\N	2026-01-09 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.reviews (id, user_id, vendor_id, product_id, order_id, rating, comment, images, is_verified_purchase, status, vendor_reply, replied_at, helpful_count, created_at, updated_at) FROM stdin;
42154bb8-7f7c-4539-a260-1f5f1b786391	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440010	\N	\N	4	Good value for money. Fresh ingredients.	{}	t	published	\N	\N	18	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
4fd45660-c78c-43d6-a168-0b11db389570	2717762d-f1f3-4099-8333-a03acbf828b2	550e8400-e29b-41d4-a716-446655440010	\N	\N	5	Healthy and delicious. Will order again.	{}	t	published	\N	\N	3	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
9f95c68a-1f31-485d-b477-e809855a8a88	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440010	\N	\N	5	Great food! Loved the taste and portion size.	{}	t	published	\N	\N	0	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
3de231dc-3236-4db2-ae4e-10f34232ae90	0c245f14-d001-421d-bb34-1f76287d139a	550e8400-e29b-41d4-a716-446655440010	\N	\N	4	Great food! Loved the taste and portion size.	{}	t	published	\N	\N	9	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
85136fee-8234-4c3b-8117-8c09f03eeb13	55187d8f-8261-4283-9a39-15f8d5890d34	550e8400-e29b-41d4-a716-446655440010	\N	\N	5	Quick delivery and fresh food. Highly recommended!	{}	t	published	\N	\N	17	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
82b3fd3a-06dc-4c12-87ab-e4762d59d6af	91855c2c-4b22-449a-8eaf-b2eb0196054b	550e8400-e29b-41d4-a716-446655440010	\N	\N	5	Great food! Loved the taste and portion size.	{}	t	published	\N	\N	8	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
3bd82cf0-7f99-483e-847c-876517bbf279	103406e8-80d7-43b4-a127-1bef9a4e29dd	550e8400-e29b-41d4-a716-446655440010	\N	\N	5	Quick delivery and fresh food. Highly recommended!	{}	t	published	\N	\N	15	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
2a9bde4b-d8c1-437f-8184-7154cbb63722	f4cc81c0-3c55-4a03-9f6c-05b7bcd37d6c	550e8400-e29b-41d4-a716-446655440010	\N	\N	4	Great food! Loved the taste and portion size.	{}	t	published	\N	\N	5	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
59bc354f-1f07-49da-8184-4f0595177c8d	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440011	\N	\N	4	Perfect for my fitness goals. Excellent protein content.	{}	t	published	\N	\N	10	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
d97a1897-20ab-4b8f-afdb-09c0d0c71741	2717762d-f1f3-4099-8333-a03acbf828b2	550e8400-e29b-41d4-a716-446655440011	\N	\N	5	Good value for money. Fresh ingredients.	{}	t	published	\N	\N	12	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
cd8fa99e-ef55-44f5-ad2c-80ccbee097fa	b59be4e6-cc63-4f38-895f-c73e813f973c	550e8400-e29b-41d4-a716-446655440011	\N	\N	4	Good value for money. Fresh ingredients.	{}	t	published	\N	\N	5	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
532a620d-0527-4dd1-acbb-8344d9fe16e4	0c245f14-d001-421d-bb34-1f76287d139a	550e8400-e29b-41d4-a716-446655440011	\N	\N	4	Quick delivery and fresh food. Highly recommended!	{}	t	published	\N	\N	10	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
17f01060-333d-4f47-926b-445f21544dd4	55187d8f-8261-4283-9a39-15f8d5890d34	550e8400-e29b-41d4-a716-446655440011	\N	\N	4	Perfect for my fitness goals. Excellent protein content.	{}	t	published	\N	\N	17	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
7586ab89-fe3f-4c2f-9d86-399ee553ba48	91855c2c-4b22-449a-8eaf-b2eb0196054b	550e8400-e29b-41d4-a716-446655440011	\N	\N	5	Good value for money. Fresh ingredients.	{}	t	published	\N	\N	9	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
9fdc3b81-3a81-430c-b001-5e4727aed131	103406e8-80d7-43b4-a127-1bef9a4e29dd	550e8400-e29b-41d4-a716-446655440011	\N	\N	4	Great food! Loved the taste and portion size.	{}	t	published	\N	\N	5	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: review_votes; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.review_votes (id, review_id, user_id, is_helpful, created_at) FROM stdin;
\.


--
-- Data for Name: riders; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.riders (id, name, phone, email, profile_image, vehicle_type, vehicle_number, license_number, active_status, current_lat, current_lng, current_order_id, total_deliveries, avg_rating, bank_account, is_verified, is_active, created_at, updated_at) FROM stdin;
e1000001-0000-4000-8000-000000000001	Rajesh Kumar	+919876543001	\N	\N	bike	TN39AB1234	\N	online	\N	\N	\N	0	0.0	\N	t	t	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
e1000002-0000-4000-8000-000000000002	Suresh Babu	+919876543002	\N	\N	scooter	TN39CD5678	\N	online	\N	\N	\N	0	0.0	\N	t	t	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
e1000003-0000-4000-8000-000000000003	Karthik Raja	+919876543003	\N	\N	bike	TN39EF9012	\N	offline	\N	\N	\N	0	0.0	\N	t	t	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
e1000004-0000-4000-8000-000000000004	Murugan S	+919876543004	\N	\N	scooter	TN39GH3456	\N	busy	\N	\N	\N	0	0.0	\N	t	t	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
e1000005-0000-4000-8000-000000000005	Arun Kumar	+919876543005	\N	\N	bike	TN39IJ7890	\N	online	\N	\N	\N	0	0.0	\N	t	t	2025-12-10 15:45:44.987158+00	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: search_logs; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.search_logs (id, user_id, query, results_count, clicked_product_id, clicked_vendor_id, device_type, created_at) FROM stdin;
110b4f94-4aa2-4832-a163-6779fc67a149	\N	protein bowl	5	\N	\N	mobile	2025-12-10 15:45:44.987158+00
98f1a277-d58d-44a2-b428-4b8c26defd7f	\N	chicken biryani	8	\N	\N	mobile	2025-12-10 15:45:44.987158+00
f1a1a91e-573a-4f45-8918-f707f53ef8c3	\N	healthy breakfast	12	\N	\N	web	2025-12-10 15:45:44.987158+00
36b64642-8690-4ae3-a8a8-8d520ab87c7d	\N	vegan salad	3	\N	\N	mobile	2025-12-10 15:45:44.987158+00
fbe36f58-d2a9-4a18-a220-ac8f55341bd8	\N	egg white omelette	4	\N	\N	mobile	2025-12-10 15:45:44.987158+00
757a1f43-1d2a-4b81-99fa-6754968dc356	\N	low carb meals	7	\N	\N	web	2025-12-10 15:45:44.987158+00
c274a962-967a-444b-89ad-3d25a4f59899	\N	grilled chicken	6	\N	\N	mobile	2025-12-10 15:45:44.987158+00
f8a6768a-c843-46cd-a75e-f2822151e652	\N	meal plan	5	\N	\N	mobile	2025-12-10 15:45:44.987158+00
af4daa6b-ec62-4b84-bd58-e3e9aaf24f92	\N	weight loss food	9	\N	\N	web	2025-12-10 15:45:44.987158+00
d6f34e24-d6df-4785-91f2-3f012fd5c2c8	\N	high protein	11	\N	\N	mobile	2025-12-10 15:45:44.987158+00
a6dbe4fa-213d-48eb-b677-2fc5f8e86525	\N	protein	2	\N	\N	curl/8.7.1	2025-12-10 15:49:09.887061+00
\.


--
-- Data for Name: subscription_deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_deliveries (id, subscription_id, order_id, scheduled_date, delivery_status, delivered_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_items (id, subscription_id, product_id, product_name, quantity, unit_price, created_at) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.support_tickets (id, user_id, order_id, subject, description, category, priority, status, assigned_to, attachments, resolution, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_addresses (id, user_id, type, label, street, area, landmark, full_address, city, state, country, postal_code, latitude, longitude, delivery_instructions, is_default, created_at, updated_at, custom_label, zipcode, delivery_notes) FROM stdin;
89f62abd-e306-4ea6-9df7-22f2901578a9	f4cc81c0-3c55-4a03-9f6c-05b7bcd37d6c	home	\N	3328+XVJ	Teachers Colony	\N	3328+XVJ, Teachers Colony, Chinniyampalayam, Coimbatore, Tamil Nadu 641062, India	Coimbatore	Tamil Nadu	India	\N	11.05262343	77.06713907	\N	f	2025-12-06 22:26:50.400874+00	2025-12-06 22:26:50.400874+00	\N	\N	\N
77a8467f-8c55-4f67-9893-0780915efb58	b59be4e6-cc63-4f38-895f-c73e813f973c	home	\N	3328+XVJ	Teachers Colony	\N	3328+XVJ, Teachers Colony, Chinniyampalayam, Coimbatore, Tamil Nadu 641062, India	Coimbatore	Tamil Nadu	India	\N	11.05270191	77.06718831	\N	f	2025-12-06 23:09:36.461593+00	2025-12-06 23:09:36.461593+00	\N	\N	\N
\.


--
-- Data for Name: user_favorites; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.user_favorites (id, user_id, vendor_id, product_id, created_at) FROM stdin;
d6e0cd34-9b5a-4cf9-abbe-4d1d2fac0ae3	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440010	\N	2025-12-10 15:45:44.987158+00
e97df801-ce77-454f-93a4-b14fcaf4dbce	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440011	\N	2025-12-10 15:45:44.987158+00
37dbe7cc-dfaf-4ac9-b9f4-74e1cc065903	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440012	\N	2025-12-10 15:45:44.987158+00
69618454-0655-403a-8c97-98c26c20d04b	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440013	\N	2025-12-10 15:45:44.987158+00
1b534812-dd8a-43bb-bb37-10c69fa59f49	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440014	\N	2025-12-10 15:45:44.987158+00
e38531b9-dd00-4c5a-b668-06f3e725395c	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440015	\N	2025-12-10 15:45:44.987158+00
34c2f76e-8f65-4938-bd41-aee3b67571d5	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440016	\N	2025-12-10 15:45:44.987158+00
8640291a-e164-4903-88ba-9f3711f7155c	e0d398e9-4cca-43f5-b861-12df13599056	550e8400-e29b-41d4-a716-446655440017	\N	2025-12-10 15:45:44.987158+00
2e9e29b5-5b60-472d-b60b-365995210136	2717762d-f1f3-4099-8333-a03acbf828b2	550e8400-e29b-41d4-a716-446655440010	\N	2025-12-10 15:45:44.987158+00
5baeff4d-3270-4e4b-a19f-7861c1b305d9	2717762d-f1f3-4099-8333-a03acbf828b2	550e8400-e29b-41d4-a716-446655440011	\N	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: vendor_delivery_zones; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.vendor_delivery_zones (id, vendor_id, zone_id, delivery_fee, min_delivery_time, max_delivery_time, minimum_order, is_active, created_at) FROM stdin;
ea40a63c-4a42-4dc4-b9d5-e807b4fb8395	550e8400-e29b-41d4-a716-446655440010	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
5ad4da91-c160-42a1-8e64-457e4e6e23b4	550e8400-e29b-41d4-a716-446655440011	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
cb3af3a8-593c-4435-aee5-d938386d6ca8	550e8400-e29b-41d4-a716-446655440012	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
d0b18de8-f44e-4ff1-baac-9866f648b063	550e8400-e29b-41d4-a716-446655440013	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
a1540000-361d-4fdf-a6ae-8c38f2d14f22	550e8400-e29b-41d4-a716-446655440014	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
2d567707-d991-4c36-9db1-9bfacbd220b2	550e8400-e29b-41d4-a716-446655440015	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
82e6e04a-ef3a-4fe2-a5b9-239275116871	550e8400-e29b-41d4-a716-446655440016	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
e12b786d-4dce-4870-ac79-7a747e10c401	550e8400-e29b-41d4-a716-446655440017	8aa47b1b-de10-42a9-9197-3bf7430e6988	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
46d6b7cc-e1b2-402b-90b9-139367fe52e8	550e8400-e29b-41d4-a716-446655440010	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
f34ae273-b784-4d84-913f-0a06b7f868d6	550e8400-e29b-41d4-a716-446655440011	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
afd6f8b7-5715-4a1f-9cc8-d766831a9da2	550e8400-e29b-41d4-a716-446655440012	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
2ab7ee48-292d-4758-ab5b-8d2c0dc66793	550e8400-e29b-41d4-a716-446655440013	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
b411dc89-6cd5-4b7e-9e41-974db73693b1	550e8400-e29b-41d4-a716-446655440014	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
3ea2ed19-0f68-4e15-bbaf-7b1d475b2eef	550e8400-e29b-41d4-a716-446655440015	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
9d769d63-4c0f-4268-a02d-e0490f0d6c6c	550e8400-e29b-41d4-a716-446655440016	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
26426da4-4a00-4913-b6f1-340dd621eb57	550e8400-e29b-41d4-a716-446655440017	bedb638f-482a-4691-b515-bc833a93e10b	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
c52fd0fd-0ab2-4007-be1c-5235e11a7821	550e8400-e29b-41d4-a716-446655440010	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
7c5b30a9-2b27-45a1-baf2-92cad7dbb1cc	550e8400-e29b-41d4-a716-446655440011	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
d81c8919-4413-41f2-b218-ab30f75939f7	550e8400-e29b-41d4-a716-446655440012	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
a7a00f64-8805-4a63-ae51-b101ec70403a	550e8400-e29b-41d4-a716-446655440013	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
b5de2324-f66f-4dda-97cd-deb4066a861c	550e8400-e29b-41d4-a716-446655440014	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
0dbd923b-3358-4806-baad-0418578b87dd	550e8400-e29b-41d4-a716-446655440015	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
a5621cfd-c30a-4fe0-b343-7093f6cdefc2	550e8400-e29b-41d4-a716-446655440016	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
bdbe2ac1-40e5-4642-8108-0f2e0cff7581	550e8400-e29b-41d4-a716-446655440017	2d6d3079-2bad-4584-bcdf-c1de42740dcb	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
1f4d5a7d-1cd7-4941-84b7-6a1bf624c40e	550e8400-e29b-41d4-a716-446655440010	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
cf5131ac-a13b-4e4e-9175-08b519d85133	550e8400-e29b-41d4-a716-446655440011	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
f23416d6-f090-47a9-ae47-330700fb4dd5	550e8400-e29b-41d4-a716-446655440012	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
09c9f4d8-547d-4d30-b72d-ddeaa1501c3a	550e8400-e29b-41d4-a716-446655440013	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
19b38e48-c325-4be6-85d1-c2cb0771921a	550e8400-e29b-41d4-a716-446655440014	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
d461a1dc-d891-40a5-81c1-bb7970da3f97	550e8400-e29b-41d4-a716-446655440015	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
ff6ee3fc-9ca7-495c-b61a-dc2d986050bb	550e8400-e29b-41d4-a716-446655440016	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
97325657-e855-445b-a365-2d5354c296df	550e8400-e29b-41d4-a716-446655440017	f9de5e8c-8885-40fb-9944-4f83d18df731	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
94aa5a52-88ac-4a0c-a770-12dcb9e36364	550e8400-e29b-41d4-a716-446655440010	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
7b3be682-34d0-4e7f-9f72-59d65be3ab28	550e8400-e29b-41d4-a716-446655440011	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
0458196b-92b9-4840-833e-72a4c0529110	550e8400-e29b-41d4-a716-446655440012	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
d80243a2-33bd-4518-9186-41d766fd353a	550e8400-e29b-41d4-a716-446655440013	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
9f6ebdf0-5d4b-4214-bac0-66bc73ab7677	550e8400-e29b-41d4-a716-446655440014	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
b1643f76-dcc2-4da7-81d0-7eb66d8496a4	550e8400-e29b-41d4-a716-446655440015	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
6f37e6a7-7a6e-4d97-8221-cf33274a9dfc	550e8400-e29b-41d4-a716-446655440016	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
a637df37-5a66-42fc-a68c-056bbe46e76c	550e8400-e29b-41d4-a716-446655440017	b558fbf4-6461-459f-a7fe-332b961629a4	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
ba457404-5c04-410c-a6ee-a8ab1ec0b999	550e8400-e29b-41d4-a716-446655440010	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
a7ced0e8-76fb-47a1-b0ba-ca5c88a46833	550e8400-e29b-41d4-a716-446655440011	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
d3eb1eb3-5ea8-4410-80ce-705509b8ac50	550e8400-e29b-41d4-a716-446655440012	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
a67d6f51-baeb-4660-addd-7e2612646bab	550e8400-e29b-41d4-a716-446655440013	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
dd2640b4-97f2-4d43-84d3-d0343d0c3ca8	550e8400-e29b-41d4-a716-446655440014	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
4ec3eb6d-3649-4d42-9e77-4d3984842a94	550e8400-e29b-41d4-a716-446655440015	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
31c91a34-95d4-46ca-9485-357356cd88e9	550e8400-e29b-41d4-a716-446655440016	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
3a91e87a-987b-4c7d-bd54-0058367efcd5	550e8400-e29b-41d4-a716-446655440017	036cb44a-15a3-4109-9eae-a19b8dca751f	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
4504cecd-df73-445b-9f05-7891d2965fb2	550e8400-e29b-41d4-a716-446655440010	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
273d87e7-95f6-44af-aa7d-03e57dd95d92	550e8400-e29b-41d4-a716-446655440011	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
8a446d89-58c3-4c3a-ae76-956daf5da18e	550e8400-e29b-41d4-a716-446655440012	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
bebcf5ed-6c94-41a4-9e8b-58420d951d79	550e8400-e29b-41d4-a716-446655440013	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
1f0e928c-fb23-4cbb-8d97-7a2f50b038f4	550e8400-e29b-41d4-a716-446655440014	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
436a2f93-acbf-4987-a4b5-17fe27a19034	550e8400-e29b-41d4-a716-446655440015	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
d6619f7c-5846-4a46-a8d8-6254e49e5a88	550e8400-e29b-41d4-a716-446655440016	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
e675fed5-862c-4351-96aa-6999e8b84d19	550e8400-e29b-41d4-a716-446655440017	d1000001-0000-4000-8000-000000000001	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
117adc6e-3acb-4655-b25f-81c696c43721	550e8400-e29b-41d4-a716-446655440010	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
c46e6294-25c5-422b-95c8-7c708b1ded18	550e8400-e29b-41d4-a716-446655440011	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
16f6bf63-82ad-4814-a8ab-4a15d1c6f7c2	550e8400-e29b-41d4-a716-446655440012	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
86c7ad8e-d16e-4667-b886-af83c8df80b6	550e8400-e29b-41d4-a716-446655440013	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
5787a049-96ee-4433-97b0-cd947f5fb622	550e8400-e29b-41d4-a716-446655440014	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
70dabfef-d187-4ac4-8d97-4dc758754203	550e8400-e29b-41d4-a716-446655440015	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
3272ef3f-d88e-4ef7-be5a-a36904f6a61d	550e8400-e29b-41d4-a716-446655440016	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
973e41a6-6f37-49d0-a1ef-ede7d5a5a51b	550e8400-e29b-41d4-a716-446655440017	d1000002-0000-4000-8000-000000000002	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
8df5a61c-47c1-448b-9b9d-2211e59dee70	550e8400-e29b-41d4-a716-446655440010	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
9eef63fd-a66a-4194-a69b-43ad9b48e07a	550e8400-e29b-41d4-a716-446655440011	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
6f4b0d5b-f1e0-4199-acca-02ca55d21ad3	550e8400-e29b-41d4-a716-446655440012	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
e840eb1f-8701-4a90-ace9-3e8d1e00415e	550e8400-e29b-41d4-a716-446655440013	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
8feab1c2-d1f3-4c16-84bf-93f77c856b92	550e8400-e29b-41d4-a716-446655440014	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
bd51520b-411b-4e2c-acb4-7c5c2c6aef76	550e8400-e29b-41d4-a716-446655440015	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
4e0f877a-39a7-4871-9e1c-18e1b9d03d2a	550e8400-e29b-41d4-a716-446655440016	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
751e5b91-f777-4d4c-9357-b4bd09583454	550e8400-e29b-41d4-a716-446655440017	d1000003-0000-4000-8000-000000000003	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
b4cc2442-1b48-48ab-a575-13ba234ec6e9	550e8400-e29b-41d4-a716-446655440010	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
522bf163-e572-4e89-8932-9746cda2bf81	550e8400-e29b-41d4-a716-446655440011	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
2a2b2cb3-c048-48c4-8095-88745c8c1486	550e8400-e29b-41d4-a716-446655440012	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
f8e72bf4-63db-4841-8e85-976ca667075a	550e8400-e29b-41d4-a716-446655440013	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
2bba6430-471f-4c90-aea3-b86643d32629	550e8400-e29b-41d4-a716-446655440014	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
bc6bf0d0-c3ee-4cf7-8200-3795ffd84523	550e8400-e29b-41d4-a716-446655440015	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
5b1d5e7b-6387-4f94-bc92-145781c113d8	550e8400-e29b-41d4-a716-446655440016	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
583014b1-e61a-4116-9217-7d3878451eda	550e8400-e29b-41d4-a716-446655440017	d1000004-0000-4000-8000-000000000004	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
ccde23d3-33ed-42b0-a6a9-729456290a88	550e8400-e29b-41d4-a716-446655440010	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
7ea99d83-74fb-4715-a820-d85baa844dc8	550e8400-e29b-41d4-a716-446655440011	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
b89dc45b-6d77-4027-bb17-117dece0f6ef	550e8400-e29b-41d4-a716-446655440012	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
52491d4a-e813-43fe-9b2b-85d0df829cc2	550e8400-e29b-41d4-a716-446655440013	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
e9753012-622c-4e24-b6ca-a2209b25a49b	550e8400-e29b-41d4-a716-446655440014	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
319586fd-56fb-4805-b82f-3c89ba04d2f9	550e8400-e29b-41d4-a716-446655440015	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
16ed8eef-fe19-4f5a-a6b8-962b2e4890db	550e8400-e29b-41d4-a716-446655440016	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
17b8bc89-1483-481b-aec8-a0595df04f06	550e8400-e29b-41d4-a716-446655440017	d1000005-0000-4000-8000-000000000005	25.00	20	35	100.00	t	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: vendor_payouts; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.vendor_payouts (id, vendor_id, period_start, period_end, gross_amount, commission, tax_deducted, net_amount, order_count, status, payment_reference, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: vendor_schedules; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.vendor_schedules (id, vendor_id, day_of_week, opening_time, closing_time, is_closed, created_at) FROM stdin;
1f3b63c5-4e6e-49d2-8dc9-9c693af51107	550e8400-e29b-41d4-a716-446655440010	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
fc7fddea-664f-4ce1-8455-777e56d98013	550e8400-e29b-41d4-a716-446655440010	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
12d2fd55-9efe-492c-8ee7-0ea847eb3baf	550e8400-e29b-41d4-a716-446655440010	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
c5a5f271-0f12-403d-ba27-d7663d794da9	550e8400-e29b-41d4-a716-446655440010	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
70ccbaf3-2c25-4253-9190-7cb21873261d	550e8400-e29b-41d4-a716-446655440010	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
a36b2fd2-5afe-4063-a8fc-49c56d650c0d	550e8400-e29b-41d4-a716-446655440010	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
6a33868f-411f-4b95-afc4-489394f298d1	550e8400-e29b-41d4-a716-446655440010	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
e4e68d9d-0a51-4d6c-a99e-68b1f49e8545	550e8400-e29b-41d4-a716-446655440011	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
e7fced5e-44ca-41fe-9bd4-572e4825ac56	550e8400-e29b-41d4-a716-446655440011	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
41b30572-b4ef-452c-bcfd-25b071a89700	550e8400-e29b-41d4-a716-446655440011	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
00e1abf4-d8f6-4bc8-8310-9868a2691552	550e8400-e29b-41d4-a716-446655440011	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
2d4d00ae-099c-4f75-8c3a-4e5054861f64	550e8400-e29b-41d4-a716-446655440011	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
b2eb7462-28fc-428b-ada6-9d9d5d8f167f	550e8400-e29b-41d4-a716-446655440011	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
a69121cd-7378-4b2f-90a5-ed07cef21874	550e8400-e29b-41d4-a716-446655440011	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
dc3e4571-aec5-44e1-bc3f-24246e9eeb7a	550e8400-e29b-41d4-a716-446655440012	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
17833154-d416-42e6-8328-8d2ffc67ab15	550e8400-e29b-41d4-a716-446655440012	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
1f81ac3b-9881-4bcd-9c73-37ec91247cea	550e8400-e29b-41d4-a716-446655440012	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
616a90e3-0242-4fd2-be3a-c79b333b07c2	550e8400-e29b-41d4-a716-446655440012	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
e3d78392-5465-46b7-a1fe-755f422ba419	550e8400-e29b-41d4-a716-446655440012	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
b5bf68d9-d0a3-436e-804f-f907b6f644fb	550e8400-e29b-41d4-a716-446655440012	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
16b28dca-b397-4fbf-b07e-e4ee79c3ea64	550e8400-e29b-41d4-a716-446655440012	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
a44865ef-513e-444e-945a-44486ca09fea	550e8400-e29b-41d4-a716-446655440013	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
466ec98b-dbb1-4f48-9551-6d1e8bc79db4	550e8400-e29b-41d4-a716-446655440013	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
0e9b8a9d-6e39-402e-bcb1-c323aaed02eb	550e8400-e29b-41d4-a716-446655440013	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
f8ac9cb5-d9f5-453d-8147-3c87d31867c3	550e8400-e29b-41d4-a716-446655440013	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
0c85ed6a-2f87-4a2a-8395-3f54900a7af9	550e8400-e29b-41d4-a716-446655440013	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
e1e1af57-1ebe-4a24-9d7f-446c65caf259	550e8400-e29b-41d4-a716-446655440013	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
7a41ef55-7a23-4abe-9b1a-0763755d4c2e	550e8400-e29b-41d4-a716-446655440013	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
b3537736-0093-42c7-937c-10653c8fd468	550e8400-e29b-41d4-a716-446655440014	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
b20cda2d-3cfd-442b-9007-02eead8e0c8e	550e8400-e29b-41d4-a716-446655440014	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
135f2b04-e54a-48b1-a39d-93daee8ae75b	550e8400-e29b-41d4-a716-446655440014	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
906b5b24-0745-42f4-a7b9-4c7b18446c98	550e8400-e29b-41d4-a716-446655440014	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
b1905e6f-28b3-424e-a234-dbcdaf2c5fda	550e8400-e29b-41d4-a716-446655440014	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
61277a70-e30b-44c6-b540-4a0362c54afb	550e8400-e29b-41d4-a716-446655440014	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
7f1a162d-a4fb-4a4c-9059-0789592f1868	550e8400-e29b-41d4-a716-446655440014	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
457626c9-cd0b-432c-add2-719a92f800a4	550e8400-e29b-41d4-a716-446655440015	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
cdc5ed45-7a4e-483e-80a7-56e385f92495	550e8400-e29b-41d4-a716-446655440015	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
59eaeb49-bbc5-4b23-afce-69b8398fd7fb	550e8400-e29b-41d4-a716-446655440015	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
84d7bd43-917c-402b-9092-4cb81b938a0c	550e8400-e29b-41d4-a716-446655440015	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
c7ce46ca-9223-4062-afd6-f5a70577dc41	550e8400-e29b-41d4-a716-446655440015	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
50157023-71e7-4e92-9d46-d6c90bd33332	550e8400-e29b-41d4-a716-446655440015	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
0a86a5e3-df26-4648-9352-6e6273f99073	550e8400-e29b-41d4-a716-446655440015	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
62af2b7d-4c14-4917-af1b-0e88de719ed5	550e8400-e29b-41d4-a716-446655440016	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
31359958-f5c9-464d-867f-b41a8fee36ec	550e8400-e29b-41d4-a716-446655440016	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
67cf901c-80ec-4c31-aa1c-2c0e9b4f8c79	550e8400-e29b-41d4-a716-446655440016	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
02c7ffe5-b3f1-421a-8cec-a5f0d6abe103	550e8400-e29b-41d4-a716-446655440016	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
cea7c097-b601-4263-a947-a019452844ce	550e8400-e29b-41d4-a716-446655440016	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
c4a25e22-3d9c-48e2-9090-cf8c29dae5bf	550e8400-e29b-41d4-a716-446655440016	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
d19e8b3c-96d2-4fae-83ad-4a914dd37869	550e8400-e29b-41d4-a716-446655440016	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
29b3752f-bd35-457d-a951-a4249e8fdf4b	550e8400-e29b-41d4-a716-446655440017	0	08:00:00	22:00:00	t	2025-12-10 15:45:44.987158+00
d9bc8d53-a4c1-4249-8fe6-eea23b6313ff	550e8400-e29b-41d4-a716-446655440017	1	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
87a504a9-6386-4b0b-ac2a-6ae12a3f12b7	550e8400-e29b-41d4-a716-446655440017	2	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
e2d28ccc-aae5-4119-b2e7-91a74191c496	550e8400-e29b-41d4-a716-446655440017	3	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
af29cc79-b924-4146-81cb-d549eeac37b7	550e8400-e29b-41d4-a716-446655440017	4	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
d2ebc51f-bc3a-4699-9916-a1b7ba1e13ca	550e8400-e29b-41d4-a716-446655440017	5	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
29eaccee-3822-4a8d-aa7a-e4df55e8c256	550e8400-e29b-41d4-a716-446655440017	6	08:00:00	22:00:00	f	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: vendor_special_hours; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.vendor_special_hours (id, vendor_id, special_date, opening_time, closing_time, is_closed, reason, created_at) FROM stdin;
\.


--
-- Data for Name: waitlist; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.waitlist (id, user_id, type, target_id, user_phone, user_email, notified, notified_at, created_at) FROM stdin;
851e8d93-48ce-4bee-8fd8-74bb9e633c87	\N	zone	d1000001-0000-4000-8000-000000000001	+919800000001	user1@example.com	f	\N	2025-12-10 15:45:44.987158+00
fab795fb-3d14-40e7-ac1c-5c0d31dd3048	\N	zone	d1000002-0000-4000-8000-000000000002	+919800000002	user2@example.com	f	\N	2025-12-10 15:45:44.987158+00
\.


--
-- Data for Name: messages_2025_11_12; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_12 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_13; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_13 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_14; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_14 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_15; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_15 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_16; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_16 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-11-13 14:03:59
20211116045059	2025-11-13 14:03:59
20211116050929	2025-11-13 14:04:00
20211116051442	2025-11-13 14:04:00
20211116212300	2025-11-13 14:04:00
20211116213355	2025-11-13 14:04:00
20211116213934	2025-11-13 14:04:00
20211116214523	2025-11-13 14:04:00
20211122062447	2025-11-13 14:04:00
20211124070109	2025-11-13 14:04:00
20211202204204	2025-11-13 14:04:00
20211202204605	2025-11-13 14:04:00
20211210212804	2025-11-13 14:04:00
20211228014915	2025-11-13 14:04:00
20220107221237	2025-11-13 14:04:00
20220228202821	2025-11-13 14:04:00
20220312004840	2025-11-13 14:04:00
20220603231003	2025-11-13 14:04:00
20220603232444	2025-11-13 14:04:00
20220615214548	2025-11-13 14:04:00
20220712093339	2025-11-13 14:04:00
20220908172859	2025-11-13 14:04:00
20220916233421	2025-11-13 14:04:00
20230119133233	2025-11-13 14:04:00
20230128025114	2025-11-13 14:04:00
20230128025212	2025-11-13 14:04:00
20230227211149	2025-11-13 14:04:00
20230228184745	2025-11-13 14:04:00
20230308225145	2025-11-13 14:04:00
20230328144023	2025-11-13 14:04:00
20231018144023	2025-11-13 14:04:00
20231204144023	2025-11-13 14:04:00
20231204144024	2025-11-13 14:04:00
20231204144025	2025-11-13 14:04:00
20240108234812	2025-11-13 14:04:00
20240109165339	2025-11-13 14:04:00
20240227174441	2025-11-13 14:04:00
20240311171622	2025-11-13 14:04:00
20240321100241	2025-11-13 14:04:00
20240401105812	2025-11-13 14:04:01
20240418121054	2025-11-13 14:04:01
20240523004032	2025-11-13 14:04:01
20240618124746	2025-11-13 14:04:01
20240801235015	2025-11-13 14:04:01
20240805133720	2025-11-13 14:04:01
20240827160934	2025-11-13 14:04:01
20240919163303	2025-11-13 14:04:01
20240919163305	2025-11-13 14:04:01
20241019105805	2025-11-13 14:04:01
20241030150047	2025-11-13 14:04:01
20241108114728	2025-11-13 14:04:01
20241121104152	2025-11-13 14:04:01
20241130184212	2025-11-13 14:04:01
20241220035512	2025-11-13 14:04:01
20241220123912	2025-11-13 14:04:01
20241224161212	2025-11-13 14:04:01
20250107150512	2025-11-13 14:04:01
20250110162412	2025-11-13 14:04:01
20250123174212	2025-11-13 14:04:01
20250128220012	2025-11-13 14:04:01
20250506224012	2025-11-13 14:04:01
20250523164012	2025-11-13 14:04:01
20250714121412	2025-11-13 14:04:01
20250905041441	2025-11-13 14:04:01
20251103001201	2025-11-13 14:04:01
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
Gutzo	Gutzo	\N	2025-11-01 13:24:10.778274+00	2025-11-01 13:24:10.778274+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_namespaces (id, bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_tables (id, namespace_id, bucket_id, name, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-11-13 14:04:00.031263
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-11-13 14:04:00.046327
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-11-13 14:04:00.055363
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-11-13 14:04:00.097128
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-11-13 14:04:00.143705
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-11-13 14:04:00.152887
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-11-13 14:04:00.162207
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-11-13 14:04:00.177288
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-11-13 14:04:00.184733
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-11-13 14:04:00.192212
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-11-13 14:04:00.206439
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-11-13 14:04:00.219585
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-11-13 14:04:00.235383
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-11-13 14:04:00.249375
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-11-13 14:04:00.270523
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-11-13 14:04:00.316536
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-11-13 14:04:00.327865
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-11-13 14:04:00.33241
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-11-13 14:04:00.33712
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-11-13 14:04:00.346936
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-11-13 14:04:00.354282
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-11-13 14:04:00.36442
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-11-13 14:04:00.411989
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-11-13 14:04:00.466541
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-11-13 14:04:00.484814
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-11-13 14:04:00.494024
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-11-13 14:04:00.502071
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-11-13 14:04:00.545557
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-11-13 14:04:00.900192
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-11-13 14:04:00.908714
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-11-13 14:04:00.914958
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-11-13 14:04:00.997162
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-11-13 14:04:01.02426
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-11-13 14:04:01.045895
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-11-13 14:04:01.049951
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-11-13 14:04:01.063766
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-11-13 14:04:01.067982
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-11-13 14:04:01.085546
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-11-13 14:04:01.095566
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-11-13 14:04:01.143673
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-11-13 14:04:01.150381
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-11-13 14:04:01.164999
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-11-13 14:04:01.17338
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-11-13 14:04:01.181468
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-11-13 14:04:01.185993
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-11-13 14:04:01.191344
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
60eebc6c-c821-474b-ba90-68e01e8ebbfe	Gutzo	GUTZO1.svg	\N	2025-11-13 18:16:06.056134+00	2025-12-10 08:11:17.189254+00	2025-11-13 18:16:06.056134+00	{"eTag": "\\"f2a8222fa3b7ecd65ca4b3128aa28334\\"", "size": 6837, "mimetype": "image/svg+xml", "cacheControl": "max-age=3600", "lastModified": "2025-12-10T08:11:17.182Z", "contentLength": 6837, "httpStatusCode": 200}	930eec41-9181-4dcd-8c5b-276051c070dc	\N	\N	1
0ac486d3-374f-4380-9785-bca28aeaa796	Gutzo	GUTZO.svg	\N	2025-12-10 08:10:48.688873+00	2025-12-10 08:11:23.712395+00	2025-12-10 08:10:48.688873+00	{"eTag": "\\"80a0ca7c26cab9f5f7f9b0ac0e2ecb42\\"", "size": 9099, "mimetype": "image/svg+xml", "cacheControl": "max-age=3600", "lastModified": "2025-12-10T08:11:23.708Z", "contentLength": 9099, "httpStatusCode": 200}	fbbca259-1895-4ab5-b552-5abdb87b66a3	\N	\N	1
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-11-13 14:03:27.122288+00
20210809183423_update_grants	2025-11-13 14:03:27.122288+00
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

