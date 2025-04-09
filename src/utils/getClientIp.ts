import axios from "axios";
import { Result } from "@interfaces/result.interface";

export const getClientIp = async (): Promise<Result> => {
  try {
    const response  = await axios.get("https://api.ipify.org?format=json");
    if (response.status !== 200) {
      return { success: false, error: "IP 주소 가져오기 실패."}
    }
    return { success: true, data: response.data.ip };
  } catch (error) {
    console.error("IP 주소 가져오기 실패: ", error);
    return { success: false, error: "IP 주소 가져오기 실패." }
  }
}