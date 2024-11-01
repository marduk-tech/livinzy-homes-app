import { Button, Modal } from "antd";
import { useState } from "react";

export function LoginModal() {
  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" size="small" onClick={showModal}>
        Login
      </Button>
      <Modal
        title="Login"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[]}
      ></Modal>
    </>
  );
}
