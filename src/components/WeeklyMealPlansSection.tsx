import React, { useEffect, useState } from "react";
import { nodeApiService } from "../utils/nodeApi";
import { toast } from "sonner";

export type MealPlan = {
	id: string;
	title: string;
	vendor: string;
	vendorId?: string;
	vendorLogo?: string;
	rating: number;
	price: string;
	schedule: string;
	features: string[];
	image: string;
	// Dynamic UI Fields
	trustText?: string;
	
	// Menu Data
	dayMenu?: Array<{
		day_of_week: number;
		day_name: string;
		breakfast_item?: string;
		lunch_item?: string;
		dinner_item?: string;
		snack_item?: string;
	}>;
};

interface WeeklyMealPlansSectionProps {
	noPadding?: boolean; 
	onMealPlanClick?: (plan: MealPlan) => void;
	disabled?: boolean;
}

export default function WeeklyMealPlansSection({ noPadding = false, onMealPlanClick, disabled }: WeeklyMealPlansSectionProps) {
	const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchMealPlans = async () => {
			try {
				const response = await nodeApiService.getMealPlans();
				if (response.success && Array.isArray(response.data)) {
					const mappedPlans: MealPlan[] = response.data.map((plan: any) => ({
						id: plan.id,
						title: plan.title,
						vendor: plan.vendor?.name || plan.vendor_name || 'Unknown Vendor',
						vendorId: plan.vendor?.id || plan.vendor_id,
						vendorLogo: plan.vendor?.image,
						rating: Number(plan.rating) || 4.5,
						price: plan.price_display || `₹${plan.price_per_day}/day`,
						schedule: plan.schedule || 'Mon – Sat',
						features: plan.features || [],
						image: plan.thumbnail || plan.banner_url || '/assets/mealplans/proteinpower.png',
						// Dynamic Fields
						trustText: plan.trust_text,
						dayMenu: plan.day_menu || [],
					}));
					console.log('API Response for Meal Plans:', response.data);
					console.log('Mapped Plans:', mappedPlans);
					setMealPlans(mappedPlans);
				}
			} catch (error) {
				console.error("Failed to fetch meal plans:", error);
				// toast.error("Failed to load meal plans"); // Optional: silent fail is often better for initial loading sections
			} finally {
				setLoading(false);
			}
		};

		fetchMealPlans();
	}, []);

	if (loading) {
		return (
			<section className="w-full bg-[#fafafa] pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16">
				<div className={`w-full max-w-7xl mx-auto flex flex-col${noPadding ? '' : ' px-4 sm:px-6 lg:px-8'}`}>
					<div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="min-w-[220px] h-[340px] bg-[#fafafa] rounded-2xl flex flex-col">
                {/* Image Skeleton */}
                <div className="w-full h-[180px] bg-gray-200 rounded-2xl mb-3"></div>
                {/* Content Skeleton */}
                <div className="flex flex-col flex-1 px-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div> {/* Title */}
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div> {/* Vendor */}
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div> {/* Schedule */}
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div> {/* Price */}
                  <div className="flex items-center gap-2">
                     <div className="h-3 bg-gray-200 rounded w-20"></div> {/* View Plan */}
                  </div>
                </div>
              </div>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (mealPlans.length === 0) return null;

	return (
		<section className="w-full bg-[#fafafa] pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16">
			<div className={`w-full max-w-7xl mx-auto flex flex-col${noPadding ? '' : ' px-4 sm:px-6 lg:px-8'}`}> 
				<h2
					className="text-left font-medium tracking-tight w-full mb-3 text-[20px] lg:text-[30px]"
					style={{ fontFamily: 'Poppins', letterSpacing: '-0.01em', fontWeight: 500, color: '#111', marginTop: 0 }}
				>
					Weekly Meal Plans
				</h2>
				<div
					className="gutzo-desktop-scroll scrollbar-hide flex flex-row gap-4 overflow-x-auto"
					style={{
						width: window.innerWidth < 640 
							? 'calc(100% + 16px)' 
							: window.innerWidth < 1024 
								? 'calc(100% + 24px)' 
								: 'calc(220px * 4.5 + 64px)',
						marginRight: window.innerWidth < 640 
							? '-16px' 
							: window.innerWidth < 1024 
								? '-24px' 
								: 0,
            maxWidth: window.innerWidth < 1024 ? 'none' : '100%',
					}}
				>
					{mealPlans.map((plan, idx) => (
						<div
							key={plan.id || idx}
							className="gutzo-card-hover"
							style={{
								minWidth: window.innerWidth >= 1024 ? '220px' : '170px',
								maxWidth: window.innerWidth >= 1024 ? '220px' : '220px',
								height: window.innerWidth >= 1024 ? '340px' : 'auto',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								cursor: 'pointer',
							}}
							onClick={() => {
								if (!disabled && typeof onMealPlanClick === 'function') {
									onMealPlanClick(plan);
								}
							}}
						>
							<div
								className="w-full"
								style={{
									width: window.innerWidth >= 1024 ? '100%' : undefined,
									height: window.innerWidth >= 1024 ? '180px' : '140px',
									objectFit: window.innerWidth >= 1024 ? 'cover' : 'cover',
									borderRadius: '16px',
									overflow: 'hidden',
									marginBottom: window.innerWidth >= 1024 ? '12px' : '8px',
								}}
							>
								<img
									src={plan.image}
									alt={plan.title}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										objectPosition: 'center',
										borderRadius: '16px',
									}}
								/>
							</div>
							<div className="flex flex-col flex-1 md:px-3" style={{ flexGrow: 1 }}>
								<h3
									className="text-[13px] font-bold text-gray-900 mb-0.5"
									style={{ fontFamily: 'Poppins', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}
									title={plan.title}
								>
									{plan.title}
								</h3>
								<p className="text-[11px] text-gray-500 mb-0.5">by {plan.vendor}</p>
								<p className="text-[12px] text-gray-600 mb-1" style={{ fontSize: '12px' }}>{plan.schedule}</p>
								<p className="text-[13px] font-semibold text-gray-900 mb-2">{plan.price}</p>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4, marginBottom: 10, cursor: disabled ? 'not-allowed' : 'pointer' }}>
									<span style={{ color: disabled ? '#9CA3AF' : '#1BA672', fontFamily: 'Poppins', fontWeight: 400, fontSize: 14, letterSpacing: '-0.01em', marginRight: 4 }}>
										View Plan
									</span>
									{!disabled && (
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M6 4L10 8L6 12" stroke="#1BA672" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
