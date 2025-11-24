// import { updateUserAPI } from "@/services/api";
// import { App, Form, FormProps, Modal } from "antd";
// import { Input } from "antd";
// import { useEffect, useState } from "react";
// interface IPros {
//   openUpdateModal: boolean;
//   setOpenUpdateModal: (v: boolean) => void;
//   refreshTable: () => void;
//   selectedUser: IUserTable | null;
//   setSelectedUser: (v: IUserTable | null) => void;
// }
// interface FieldType {
//   _id: string;
//   email: string;
//   fullName: string;
//   phone: string;
// }

// function UpdateUserModal(props: IPros) {
//   const {
//     openUpdateModal,
//     setOpenUpdateModal,
//     refreshTable,
//     selectedUser,
//     setSelectedUser,
//   } = props;
//   const [form] = Form.useForm();
//   const [isSubmit, setIsSubmit] = useState<boolean>(false);
//   const { message, notification } = App.useApp();
//   useEffect(() => {
//     if (selectedUser) {
//       form.setFieldsValue({
//         _id: selectedUser._id,
//         fullName: selectedUser.fullName,
//         email: selectedUser.email,
//         phone: selectedUser.phone,
//       });
//     }
//   }, [selectedUser]);

//   const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
//     setIsSubmit(true);
//     const { _id, fullName, phone } = values;
//     const res = await updateUserAPI(_id, fullName, phone);
//     if (res.data) {
//       message.success("Update user successfully");
//       form.resetFields();
//       setSelectedUser(null);
//       refreshTable();
//       setOpenUpdateModal(false);
//     } else {
//       notification.error({
//         message: "Error",
//         description: res.message,
//       });
//     }
//     setIsSubmit(false);
//   };
//   return (
//     <>
//       <Modal
//         title="Basic Modal"
//         closable={{ "aria-label": "Custom Close Button" }}
//         open={openUpdateModal}
//         onOk={() => {
//           form.submit();
//         }}
//         onCancel={() => {
//           setOpenUpdateModal(false);
//           form.resetFields();
//           setSelectedUser(null);
//         }}
//         okText={"Cập nhật"}
//         cancelText={"Huỷ"}
//         confirmLoading={isSubmit}
//       >
//         <Form
//           form={form}
//           name="basic"
//           style={{ maxWidth: 600 }}
//           layout="vertical"
//           initialValues={{ remember: true }}
//           onFinish={onFinish}
//           autoComplete="off"
//         >
//           <Form.Item<FieldType> label="_id" name="_id" hidden>
//             <Input disabled />
//           </Form.Item>

//           <Form.Item<FieldType> label="Email" name="email">
//             <Input readOnly />
//           </Form.Item>

//           <Form.Item<FieldType>
//             label="Full Name"
//             name="fullName"
//             rules={[
//               { required: true, message: "Please input your full name!" },
//             ]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item<FieldType>
//             label="Phone number"
//             name="phone"
//             rules={[{ required: true, message: "Please input your phone!" }]}
//           >
//             <Input />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// }

// export default UpdateUserModal;
