export interface Tester {
  id: number;
  code: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  signature_image: string | null;
  is_team_leader: number;
}

export interface TestItem {
  id: number;
  name: string;
  code: string;
  default_result: string;
  standard: string;
  method: string;
}

export interface ReportTestItem {
  id?: number;
  report_id?: number;
  test_item_name: string;
  test_method: string;
  test_result: string;
  test_standard: string;
  detail_method: string;
  sort_order?: number;
}

export interface ReportImage {
  id?: number;
  report_id?: number;
  image_data: string;
  caption: string;
  sort_order?: number;
}

export interface Report {
  id: number;
  report_no: string;
  receipt_date: string;
  company: string;
  issue_date: string;
  sequence: number;
  tester_id: number;
  product_name: string;
  equipment_notes: string;
  created_at: string;
  tester_name?: string;
  tester_code?: string;
  tester_title?: string;
  tester_email?: string;
  tester_signature?: string;
  test_items?: ReportTestItem[];
  images?: ReportImage[];
  test_items_summary?: string;
}
