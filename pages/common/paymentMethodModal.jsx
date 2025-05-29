import { CircleCheck, Circle, X } from "lucide-react";
import { useState } from "react";

function PaymentMethodModal({ onClose, onSelect }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const paymentMethods = [
    { name: 'UPI', icon: '/UPI.png' },
    { name: 'Net Banking', icon: '/bank.png' },
  ];

  const handleClose = () => {
    onSelect(selectedMethod); 
    onClose(); 
  };

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="popup_modals_hdfc_popup_width__xy9J9 py-8 bg-white rounded-md shadow-lg z-[1]">
            <div className="flex flex-row-reverse">
              <div className="w-full flex justify-center">
                <div className="text-apercu break-normal text-center w-[80%]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-left text-medium text-4xl text-black">Select Payment Method</div>
                    <button onClick={handleClose}>
                      <X />
                    </button>
                  </div>
                  {paymentMethods.map((method) => (
                    <div
                      key={method.name}
                      onClick={() => setSelectedMethod(method.name)}
                      className={`flex justify-between items-center p-4 mb-2 border rounded-lg cursor-pointer transition-all ${
                        selectedMethod === method.name ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex gap-2 items-center">
                        <img src={method.icon} alt={method.name} className="w-10 h-10 mr-4 object-contain" />
                        <span className="flex-1 text-gray-800">{method.name}</span>
                      </div>
                      {selectedMethod === method.name ? <CircleCheck color="green" /> : <Circle color="gray" />}
                    </div>
                  ))}
                  <button
                    className="w-full mt-4 py-3 text-white bg-green-500 rounded-lg text-lg font-semibold transition-all hover:bg-green-600"
                    onClick={handleClose}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentMethodModal;
