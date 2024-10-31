import {
  IndexTable,
  LegacyCard,
  Text,
  Modal,
  Button,
  FormLayout,
  TextField,
  Toast,
  Frame,
  ButtonGroup,
  Page,
  Badge,
  Checkbox,
} from "@shopify/polaris";
import { useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { PlusIcon, EditIcon, DeleteIcon, ViewIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server.js";
import React, { useState, useEffect, Suspense ,useCallback} from "react";
import db from '../db.server';

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query fetchCustomers {
      customers(first: 20) {
        edges {
          node {
            id
            firstName
            lastName
            email
            phone
            defaultAddress {
              address1
              address2
              city
              province
              country
              zip
            }
          }
        }
      }
    }
  `);
  const customersData = (await (await response).json()).data;

  // Fetch points and their ID from the CustomerPoint table for each customer
  const customerPoints = await db.CustomerPoint.findMany({
    where: {
      customerId: {
        in: customersData.customers.edges.map(({ node }) => node.id),
      },
    },
  });

  const pointsByCustomerId = customerPoints.reduce((acc, customerPoint) => {
    acc[customerPoint.customerId] = {
      id: customerPoint.id,
      points: customerPoint.points,
    };
    return acc;
  }, {});

  const customersWithPoints = customersData.customers.edges.map(({ node }) => ({
    ...node,
    points: pointsByCustomerId[node.id]?.points || 0,
    databaseId: pointsByCustomerId[node.id]?.id || null,
  }));

  return json({ customers: customersWithPoints });
};



export default function Customers() {
  const { customers } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [active, setActive] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [point, setPoint] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // const [selectedCustomer, setSelectedCustomer] = useState(null);
  // const [detailModalActive, setDetailModalActive] = useState(false);
  const [activeCreateModal, setActiveCreateModal] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  // const [activeAddPoints, setActiveAddPoints] = useState(false);
  // const [selectedCustomerId, setSelectedCustomerId] = useState("");
  // const [pointsToAdd, setPointsToAdd] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);



  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFirstName(customer.firstName);
    setLastName(customer.lastName);
    setEmail(customer.email);
    setPhone(customer.phone);
    setPoint(customer.points);
    setActive(true);
  };

  const handleCustomerSelectionChange = (id) => {
    setSelectedCustomers((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(customerId => customerId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleCreatePoints = async () => {
    const formData = new FormData();
    formData.append("points", point);
    selectedCustomers.forEach((customerId) => {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        formData.append("customerIds[]", customerId);
        formData.append("firstNames[]", customer.firstName);
        formData.append("lastNames[]", customer.lastName);
        formData.append("emails[]", customer.email);
        formData.append("phones[]", customer.phone);
        fetcher.submit(formData, { method: "POST", action: "/app/add" });
      }
    });
  };

  const handleModalChange = () => {
    setActive(false);
    setEditingCustomer(null);
  };
  const handleCreateModalChange = () => {
    setActive(false);
    setActiveCreateModal(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("id", editingCustomer.databaseId || '');
    formData.append("customerId", editingCustomer.customerId);
    formData.append("points", point);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phone", phone);

    fetcher.submit(formData, { method: "POST", action: "/app/edit" });
  };


  const handleDelete = async (databaseId) => {
    setDeletingCustomerId(databaseId);
    await fetcher.submit({ id: databaseId }, { method: "POST", action: "/app/delete" });
  };

  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data?.success) {
        // setToastContent(fetcher.data.success);
        const successMessage = Array.isArray(fetcher.data.success)
          ? fetcher.data.success.join(', ')
          : fetcher.data.success;
        setToastContent(successMessage);
        // setToastActive(true);
        setActiveCreateModal(false);
        setSelectedCustomers([]);
        setPoint("");
        setToastActive(true);
        setActive(false);
        fetcher.load("/app");
      } else if (fetcher.data?.errors) {
        console.error(fetcher.data.errors);
        setToastContent("Failed to update the customer.");
        setToastActive(true);
      }
      setIsSaving(false);
      setDeletingCustomerId(null);
    }
  }, [fetcher.state, fetcher.data]);

  const rowMarkup = customers.map(({ id, firstName, lastName, email, phone, defaultAddress, points, databaseId }) => {
    const fullName = `${firstName} ${lastName}`;
    const address = `${defaultAddress?.address1 || ''}, ${defaultAddress?.address2 || ''}, ${defaultAddress?.city || ''}, ${defaultAddress?.province || ''}, ${defaultAddress?.country || ''}, ${defaultAddress?.zip || ''}`;

    return (
      <IndexTable.Row
        id={databaseId || id}
        key={databaseId || id}
        position={databaseId || id}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as={"span"}>
            {fullName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{email}</IndexTable.Cell>
        <IndexTable.Cell>{phone || "N/A"}</IndexTable.Cell>
        <IndexTable.Cell>{address.trim() || "N/A"}</IndexTable.Cell>
        <IndexTable.Cell>{points || 0} </IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup>
            <Button icon={EditIcon} variant="primary" onClick={() => handleEdit({ id, databaseId, customerId: id, firstName, lastName, email, phone, points })}>Edit</Button>
            <Button icon={DeleteIcon} variant="primary" tone="critical" onClick={() => handleDelete(databaseId)} >
              Delete
            </Button>
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Frame>
      <Page
        fullWidth
        title="Customers"
        titleMetadata={<Badge status="success">New</Badge>}
        primaryAction={{
          content: 'Create a new product',
          icon: PlusIcon,
          onAction: () => setActiveCreateModal(true),
        }}
        secondaryActions={[
          {
            content: 'Export',
            accessibilityLabel: 'Secondary action label',
          },
          {
            content: 'Import',
          },
        ]}
      >
        <LegacyCard>
          <IndexTable
            resourceName={resourceName}
            itemCount={customers.length}
            headings={[
              { title: "Name" },
              { title: "Email" },
              { title: "Phone" },
              { title: "Address" },
              { title: "Point" },
              { title: "Actions" },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </LegacyCard>

        <Modal
          open={activeCreateModal}
          onClose={handleCreateModalChange}
          title="Add Points To Customer"
          primaryAction={{
            content: "Create",
            onAction: handleCreatePoints,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleCreateModalChange,
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>
              <TextField
                label="Customer Points"
                value={point}
                onChange={setPoint}
                type="number"
              />
              <Text>Choose Customers:</Text>
              {customers.map(({ id, firstName, lastName, email, phone }) => (
                <Checkbox
                  key={id}
                  label={`${firstName} ${lastName} - ${email} - ${phone || "N/A"}`}
                  checked={selectedCustomers.includes(id)}
                  onChange={() => handleCustomerSelectionChange(id)}
                />
              ))}
            </FormLayout>
          </Modal.Section>
        </Modal>

        <Modal
          open={active}
          onClose={handleModalChange}
          title="Edit Customer Point"
          primaryAction={{
            content: "Save",
            onAction: handleSave,
            loading: isSaving,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleModalChange,
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>
              <TextField label="First Name" value={firstName} readOnly />
              <TextField label="Last Name" value={lastName} readOnly />
              <TextField label="Email" value={email} readOnly />
              <TextField label="Phone" value={phone} readOnly />

              <TextField
                label="Customer Points"
                value={point}
                onChange={setPoint}
                type="number"
              />
            </FormLayout>

          </Modal.Section>
        </Modal>

        {toastActive && <Toast content={toastContent} onDismiss={() => setToastActive(false)} />}
      </Page>
    </Frame>
  );
}
