import { createConfig, getConfigs, updateConfig } from "@/api/config.api.js";
import type { Config } from "@/type/config.type.js";
import { getSession } from "@/utils/auth.util.js";
import { handleHttpError } from "@/utils/common.util.js";
import { ActionIcon, Box, Button, Flex, Modal, Table, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Navigate } from "react-router";

export default function ConfigsPage() {
  if (!getSession()?.isAdmin) {
    return <Navigate to="/" />;
  }
  return (
    <>
      <title>Configs</title>
      <PageContent />
    </>
  );
}

const PageContent = () => {
  const dataQuery = useQuery({
    queryKey: ["configs"],
    queryFn: getConfigs,
  });
  const configs = dataQuery.data?.data;

  return (
    <Box>
      <Flex justify="flex-end">
        <UpdateModal />
      </Flex>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Key</Table.Th>
            <Table.Th>Value</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {configs?.map((config) => {
            return (
              <Table.Tr key={config.key}>
                <Table.Td>{config.key}</Table.Td>
                <Table.Td>{config.value}</Table.Td>
                <Table.Td>
                  <UpdateModal data={config} />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
};

type FormValues = {
  key: string;
  value: string;
};

const UpdateModal = (props: { data?: Config }) => {
  const isUpdate = !!props.data;
  const [modalOpen, modalActions] = useDisclosure();
  const formMethods = useForm<FormValues>();
  const saveMutation = useMutation({
    mutationKey: ["configs"],
    mutationFn: (data: Config) => (isUpdate ? updateConfig(data) : createConfig(data)),
  });

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await saveMutation.mutateAsync(data);
      formMethods.reset();
      modalActions.close();
    } catch (e) {
      handleHttpError(e);
    }
  };

  useEffect(() => {
    if (!props.data) return;
    formMethods.reset(props.data);
  }, [props.data]);

  return (
    <>
      {isUpdate ? (
        <ActionIcon onClick={modalActions.open}>
          <IconEdit size={16} />
        </ActionIcon>
      ) : (
        <Button onClick={modalActions.open} leftSection={<IconPlus size={16} />}>
          Add
        </Button>
      )}
      <Modal opened={modalOpen} onClose={modalActions.close} centered title={isUpdate ? "Update" : "Create"}>
        <Box component="form" onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <TextInput label="Key" {...formMethods.register("key")} disabled={isUpdate} />
          <TextInput label="Value" {...formMethods.register("value")} mt="xs" />
          <Button type="submit" mt="md">
            Submit
          </Button>
        </Box>
      </Modal>
    </>
  );
};
