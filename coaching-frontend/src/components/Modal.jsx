import "./Modal.css";

function Modal({ title, children, onClose }) {
  return (
    <div className="overlay">
      <div className="modal">
        <h3>{title}</h3>

        {children}

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;