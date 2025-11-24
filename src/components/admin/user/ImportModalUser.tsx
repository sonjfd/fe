// import { InboxOutlined } from "@ant-design/icons";
// import type { UploadProps } from "antd";
// import { App, Modal, Table, Upload } from "antd";
// import { useState } from "react";
// import ExcelJS from "exceljs";
// import { bulkCreateUserAPI } from "@/services/api";
// import templateFile from "assets/template/user.xlsx?url";
// const { Dragger } = Upload;

// interface IProps {
//   openModalImport: boolean;
//   setOpenModalImport: (v: boolean) => void;
//   refreshTable: () => void;
// }

// interface IDataImport {
//   fullName: string;
//   email: string;
//   phone: string;
// }

// function ImportModalUser({
//   openModalImport,
//   setOpenModalImport,
//   refreshTable,
// }: IProps) {
//   const { message, notification } = App.useApp();
//   const [dataImport, setDataImport] = useState<IDataImport[]>([]);
//   const [isSubmit, setIsSubmit] = useState<boolean>(false);

//   const propsUpload: UploadProps = {
//     name: "file",
//     multiple: false,
//     maxCount: 1,
//     accept:
//       ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

//     // Giả lập upload (vì không gửi lên server thật)
//     customRequest({ onSuccess }) {
//       setTimeout(() => {
//         onSuccess?.("ok");
//       }, 1000);
//     },

//     async onChange(info) {
//       const { status } = info.file;

//       if (status === "done") {
//         message.success(`${info.file.name} uploaded successfully.`);

//         if (info.fileList?.length > 0) {
//           const file = info.fileList[0].originFileObj!;
//           const workbook = new ExcelJS.Workbook();
//           const arrayBuffer = await file.arrayBuffer();
//           await workbook.xlsx.load(arrayBuffer);

//           const jsonData: IDataImport[] = [];

//           workbook.worksheets.forEach((sheet) => {
//             const firstRow = sheet.getRow(1);
//             if (!firstRow?.cellCount) return;

//             const keys = (firstRow.values || []) as string[];

//             sheet.eachRow((row, rowNumber) => {
//               if (rowNumber === 1) return;

//               const values = (row.values || []) as any[];
//               const obj: any = {};

//               for (let i = 1; i < keys.length; i++) {
//                 obj[keys[i]] = values[i];
//               }

//               jsonData.push(obj);
//             });
//           });

//           setDataImport(jsonData);
//         }
//       } else if (status === "error") {
//         message.error(`${info.file.name} upload failed.`);
//       }
//     },

//     onDrop(e) {
//       console.log("Dropped files", e.dataTransfer.files);
//     },
//   };

//   const handleImport = async () => {
//     setIsSubmit(true);
//     const dataSubmit = dataImport.map((item) => ({
//       ...item,
//       password: import.meta.env.VITE_USER_CREATE_DEFAULT_PASSWORD,
//     }));

//     const res = await bulkCreateUserAPI(dataSubmit);
//     if (res.data) {
//       notification.success({
//         message: "Bulk Create Users",
//         description: `Success = ${res.data.countSuccess}. Error = ${res.data.countError}`,
//       });
//       setOpenModalImport(false);
//       setDataImport([]);
//       refreshTable();
//     }
//     setIsSubmit(false);
//   };

//   return (
//     <Modal
//       title="Import data user"
//       width="50vw"
//       open={openModalImport}
//       onOk={handleImport}
//       onCancel={() => {
//         setOpenModalImport(false);
//         setDataImport([]);
//       }}
//       okText="Import data"
//       okButtonProps={{
//         disabled: dataImport.length > 0 ? false : true,
//         loading: isSubmit,
//       }}
//       maskClosable={false}
//       destroyOnClose={true}
//     >
//       <Dragger {...propsUpload}>
//         <p className="ant-upload-drag-icon">
//           <InboxOutlined />
//         </p>
//         <p className="ant-upload-text">
//           Click or drag file to this area to upload
//         </p>
//         <p className="ant-upload-hint">
//           Support for a single upload. Only accept .csv, .xls, .xlsx &nbsp;{" "}
//           <a href={templateFile} onClick={(e) => e.stopPropagation()}>
//             Download Sample File
//           </a>
//         </p>
//       </Dragger>

//       <div style={{ paddingTop: 20 }}>
//         <Table
//           title={() => <span>Dữ liệu upload:</span>}
//           dataSource={dataImport}
//           rowKey={(r) => r.email}
//           pagination={false}
//           columns={[
//             { dataIndex: "fullName", title: "Tên hiển thị" },
//             { dataIndex: "email", title: "Email" },
//             { dataIndex: "phone", title: "Số điện thoại" },
//           ]}
//         />
//       </div>
//     </Modal>
//   );
// }

// export default ImportModalUser;
