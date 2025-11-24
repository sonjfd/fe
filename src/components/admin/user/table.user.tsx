import { deleteUSerAPI, getUsersApi } from "@/services/api";
import { dateRangeValidate } from "@/services/helper";
import {
  // CloudUploadOutlined,
  DeleteTwoTone,
  EditTwoTone,
  ExpandAltOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm } from "antd";
import { useRef, useState } from "react";
import UserDetail from "./UserDetail";
// import CreateUser from "./CreateUser";
// import ImportModalUser from "./ImportModalUser";
// import { CSVLink } from "react-csv";
// import UpdateUserModal from "./UpdateUserModal";

interface Paginate {
  current: number;
  pageSize: number;
  pages: number;
  total: number;
}

type TSearch = {
  fullName: string;
  email: string;
  createdAt: string;
  createdAtRange?: string;
};
const TableUser = () => {
  const [meta, setMeta] = useState<Paginate>({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });
  const actionRef = useRef<ActionType | null>(null);
  const [openUserDetailModel, setOpenUserDetailModel] =
    useState<boolean>(false);
  // const [openCreateUser, setOpenCreateUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUserTable | null>(null);
  const [openModalImport, setOpenModalImport] = useState<boolean>(false);
  const [currentDataTable, setCurrentDataTable] = useState<IUserTable[]>([]);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const { message, notification } = App.useApp();
  const handleDeleteUser = async (_id: string) => {
    const res = await deleteUSerAPI(_id);
    if (res && res.data) {
      message.success("Delete user successfully");
      refreshTable();
    } else {
      notification.error({
        message: "Error",
        description: res.message,
      });
    }
  };
  const columns: ProColumns<IUserTable>[] = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
    },
    {
      title: "Id",
      hideInSearch: true,
      dataIndex: "_id",
      render(_, entity) {
        return (
          <a
            href="#"
            onClick={() => {
              setOpenUserDetailModel(true);
              setSelectedUser(entity);
            }}
          >
            {entity._id}
          </a>
        );
      },
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAtRange",
      valueType: "dateRange",
      hideInTable: true,
    },
    {
      title: "Action",
      hideInSearch: true,
      render(_, entity) {
        return (
          <>
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", margin: 15 }}
              onClick={() => {
                setOpenUpdateModal(true);
                setSelectedUser(entity);
                console.log(entity);
              }}
            />

            <Popconfirm
              title="Xoá người dùng"
              description="Bạn có chắc muốn xoá người dùng này?"
              onConfirm={() => handleDeleteUser(entity._id)}
              okText="Yes"
              cancelText="No"
            >
               <DeleteTwoTone
                twoToneColor="#ff4d4f"
                style={{ cursor: "pointer" }}
              />
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const refreshTable = () => {
    actionRef.current?.reload();
  };
  return (
    <>
      <ProTable<IUserTable, TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          let query = "";
          if (params) {
            query += `current=${params.current}&pageSize=${params.pageSize}`;
            if (params.email) {
              query += `&email=/${params.email}/i`;
            }
            if (params.fullName) {
              query += `&fullName=/${params.fullName}/i`;
            }
            const createDateRange = dateRangeValidate(params?.createdAtRange);
            if (createDateRange) {
              query += `&createdAt>=${createDateRange[0]}&createdAt<=${createDateRange[1]}`;
            }
          }
          if (sort && sort.createdAt) {
            query += `&sort=${
              sort.createdAt === "ascend" ? "createdAt" : "-createdAt"
            }`;
          } else {
            query += `&sort=-createdAt`;
          }
          const res = await getUsersApi(query);
          if (res.data) {
            setMeta(res.data.meta);
            setCurrentDataTable(res.data?.result ?? []);
          }
          return {
            data: res.data?.result,
            page: 1,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => (
            <div>
              {range[0]} - {range[1]} trên {total} dòng
            </div>
          ),
        }}
        dateFormatter="string"
        headerTitle="Table user"
        toolBarRender={() => [
          <Button key="button" icon={<ExpandAltOutlined />} type="primary">
            {/* <CSVLink data={currentDataTable} filename="export-data.csv">
              Export
            </CSVLink> */}
          </Button>,

          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenModalImport(true);
            }}
            type="primary"
          >
            Import
          </Button>,

          // <Button
          //   key="button"
          //   icon={<CloudUploadOutlined />}
          //   onClick={() => {
          //     setOpenCreateUser(true);
          //   }}
          //   type="primary"
          // >
          //   Create User
          // </Button>,
        ]}
      />
      <UserDetail
        openUserDetailModel={openUserDetailModel}
        setOpenUserDetailModel={setOpenUserDetailModel}
        selectedUser={selectedUser}
      />

      {/* <CreateUser
        openCreateUser={openCreateUser}
        setOpenCreateUser={setOpenCreateUser}
        refreshTable={refreshTable}
      /> */}

      {/* <ImportModalUser
        openModalImport={openModalImport}
        setOpenModalImport={setOpenModalImport}
        refreshTable={refreshTable}
      />

      <UpdateUserModal
        openUpdateModal={openUpdateModal}
        setOpenUpdateModal={setOpenUpdateModal}
        refreshTable={refreshTable}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      /> */}
    </>
  );
};

export default TableUser;
