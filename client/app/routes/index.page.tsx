import { createQuiz, getQuizzes } from "@/api/quiz.api.js";
import { ScreenLoading } from "@/components/screen-loading.js";
import type { Quiz } from "@/type/quiz.type.js";
import { handleHttpError } from "@/utils/common.util.js";
import { Box, Button, Flex, Modal, Text, Textarea, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router";

export const meta = () => {
  return [{ title: "Home" }];
};

type FormValues = {
  context: string;
};

const INTERVAL_MS = 1000 * 5;
const REFRESH_RANGE_MS = 1000 * 60 * 60;

export default function IndexPage() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const dataQuery = useQuery({
    queryKey: ["quizzes"],
    queryFn: getQuizzes,
    refetchInterval: needRefresh ? INTERVAL_MS : undefined,
    refetchIntervalInBackground: true,
  });
  const quizzes = dataQuery.data?.data;

  const quizzesGroupedByDate = useMemo(() => {
    const refreshFrom = dayjs().subtract(REFRESH_RANGE_MS, "millisecond").unix();
    setNeedRefresh(!!quizzes?.some((item) => !item.generated && dayjs(item.createdAt).unix() > refreshFrom));
    return quizzes?.reduce(
      (acc, cur) => {
        const date = dayjs(cur.createdAt).format("DD/MM/YYYY");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(cur);
        return acc;
      },
      {} as Record<string, Quiz[]>,
    );
  }, [quizzes]);

  return (
    <>
      <Box pos="relative">
        <Flex justify="space-between" align="center" mb="md">
          <Title fz="h3">Quizzes</Title>
          <GenerateQuiz />
        </Flex>
        <Flex direction="column" gap="md">
          {!!quizzes?.length &&
            quizzesGroupedByDate &&
            Object.keys(quizzesGroupedByDate).map((date) => {
              return (
                <Flex direction="column" gap="sm">
                  <Text fw={600}>{date}</Text>
                  <Flex direction="column" gap="sm">
                    {quizzesGroupedByDate[date].map((quiz) => {
                      const generated = !!quiz.generated;
                      return (
                        <Button
                          component={generated ? Link : undefined}
                          to={generated ? `/quizzes/${quiz.id}` : ""}
                          disabled={!generated}
                          variant="default"
                          size="lg"
                          px="md"
                          styles={{
                            inner: { justifyContent: "flex-start" },
                          }}
                        >
                          <Text truncate="end">{generated ? quiz.title : "Processing..."}</Text>
                        </Button>
                      );
                    })}
                  </Flex>
                </Flex>
              );
            })}
        </Flex>
      </Box>

      <ScreenLoading visible={dataQuery.isLoading} />
    </>
  );
}

const GenerateQuiz = () => {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const formMethods = useForm<FormValues>();
  const createMutation = useMutation({
    mutationKey: ["quizzes"],
    mutationFn: createQuiz,
  });

  const openModal = () => setIsCreateOpen(true);
  const closeModal = () => {
    setIsCreateOpen(false);
    formMethods.reset();
  };
  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      closeModal();
    } catch (e) {
      handleHttpError(e);
    }
  };

  return (
    <>
      <Button leftSection={<IconPlus />} onClick={openModal}>
        Generate
      </Button>

      <Modal opened={isCreateOpen} onClose={closeModal} title="Generate quiz" fullScreen={isMobile}>
        <Box component="form" onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Textarea label="Context" {...formMethods.register("context")} rows={10} />
          <Flex justify="flex-end">
            <Button type="submit" mt="sm">
              Submit
            </Button>
          </Flex>
        </Box>
      </Modal>
    </>
  );
};
