import { getConfigs } from "@/api/config.api.js";
import { getSession } from "@/utils/auth.util.js";
import { Box, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";

export default function ConfigPage() {
  if (!getSession()?.isAdmin) {
    return <Navigate to="/" />;
  }
  return <PageContent />;
}

const PageContent = () => {
  const dataQuery = useQuery({
    queryKey: ["configs"],
    queryFn: getConfigs,
  });
  const configs = dataQuery.data?.data;

  return (
    <>
      <title>Configs</title>
      <Box>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Key</Table.Th>
              <Table.Th>Value</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {configs?.map((config) => {
              return (
                <Table.Tr>
                  <Table.Td>{config.key}</Table.Td>
                  <Table.Td>{config.value}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>
    </>
  );
};
