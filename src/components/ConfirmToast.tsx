import { toast } from "react-toastify";

export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <div>{message}</div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                resolve(true);
                closeToast();
              }}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Đồng ý
            </button>

            <button
              onClick={() => {
                resolve(false);
                closeToast();
              }}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      ),
      {
        closeOnClick: false,
        closeButton: false,
        autoClose: false,
      }
    );
  });
}
