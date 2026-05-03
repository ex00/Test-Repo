// frontend/static/js/interfaces.ts
export interface CalendarEvent {
    id?: number;
    title: string;
    description: string;
    start_time: string; // ISO format string
    end_time: string;   // ISO format string
    owner_id?: number;
}
