import { getQuizzes } from "@/api/quiz.api.js";
import { ScreenLoading } from "@/components/screen-loading.js";
import { Box, Button, Flex, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "react-router";

export const meta = () => {
  return [{ title: "Home" }];
};

export default function IndexPage() {
  const queryData = useQuery({
    queryKey: ["quizzes"],
    queryFn: getQuizzes,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <>
      <Box pos="relative">
        <Title mb="md" fz="h3">
          Quizzes
        </Title>
        <Flex direction="column" gap="sm">
          {queryData.data?.data?.map((item) => {
            const generated = !!item.generated;
            return (
              <Button
                component={generated ? Link : undefined}
                to={generated ? `/quizzes/${item.id}` : "#"}
                disabled={!generated}
                variant="default"
                size="lg"
                px="lg"
                styles={{
                  inner: { justifyContent: "flex-start" },
                  label: { display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" },
                }}
              >
                <Text span>{dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                <Text span>-</Text>
                <Text span fw={600} display="inline">
                  {generated ? item.title : "Processing..."}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>

      <ScreenLoading visible={queryData.isLoading} />
    </>
  );
}
