export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  data: T | null;
}
