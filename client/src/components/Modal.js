import { useEffect } from "react";
import "./Modal.css";

const Modal = ({ setModalOpen, contract }) => {
  const sharing = async () => {
    const shareAddress = document.querySelector(".address").value;
    await contract.allow(shareAddress);
    console.log("Shared");
  };

  useEffect(() => {
    const accessList = async () => {
      const addressList = await contract.sharedAccess();
      let select = document.querySelector("#selectNumber");
      const options = addressList;

      for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        let e1 = document.createElement("option");
        e1.textContent = opt;
        e1.value = opt;
        select.appendChild(e1);
      }
    };
    contract && accessList();
  }, []);
  return (
    <>
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="title">Share With</div>
          <div className="body">
            <input className="address" placeholder="Enter the Address"></input>
          </div>
          <form id="myForm">
            <select id="selectNumber">
              <option className="address">People Share With</option>
            </select>
          </form>
          <div className="footer">
            <button
              id="cancelBtn"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button onClick={() => sharing()}>Share</button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Modal;
