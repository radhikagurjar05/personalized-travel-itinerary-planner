export interface ActivitySlot {
  time_slot: string;
  attraction_name: string;
  description: string;
  suggested_duration: string;
  estimated_cost: number;
  map_search_url: string;
  tips: string;
}

export interface DayPlan {
  day_number: number;
  date: string;
  theme: string;
  estimated_daily_cost: number;
  morning: ActivitySlot;
  afternoon: ActivitySlot;
  evening: ActivitySlot;
  meal_recommendations?: {
    lunch?: string;
    dinner?: string;
  };
  rainy_day_alternative?: string;
  route_optimization_tip?: string;
}

export interface BudgetSummary {
  total_estimated_cost: number;
  currency: string;
  accommodation_total: number;
  food_total: number;
  activities_total: number;
  transport_total: number;
  miscellaneous_total: number;
  cost_breakdown_note?: string;
}

export interface ItineraryData {
  trip_title: string;
  destination: string;
  overview: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  travelers_count: number;
  travel_pace: 'relaxed' | 'balanced' | 'packed';
  budget_summary: BudgetSummary;
  days: DayPlan[];
  local_cuisine_recommendations: string[];
  packing_suggestions: string[];
  practical_tips: string[];
  safety_and_accessibility: string;
  assumptions_and_limitations: string;
}

export interface SavedItinerary {
  id: string;
  user_id?: number | null;
  title: string;
  destination: string;
  starting_city?: string | null;
  start_date: string;
  end_date: string;
  duration_days: number;
  travelers_count: number;
  budget: number;
  currency: string;
  travel_pace: string;
  interests?: string[];
  preferences?: Record<string, any>;
  itinerary_data: ItineraryData;
  created_at?: string;
  updated_at?: string;
}

export interface TripFormInputs {
  destination: string;
  starting_city?: string;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget: number;
  currency: string;
  travel_interests: string[];
  travel_pace: 'relaxed' | 'balanced' | 'packed';
  accommodation_preference?: string;
  transportation_preference?: string;
  dietary_requirements?: string;
  accessibility_requirements?: string;
  additional_preferences?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}
