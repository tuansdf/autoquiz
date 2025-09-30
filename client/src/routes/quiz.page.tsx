import { generateQuestions, getQuiz, updateQuizVisibility } from "@/api/quiz.api.js";
import { ScreenLoading } from "@/components/screen-loading.js";
import type { Question, QuizDetail } from "@/type/quiz.type.js";
import { isAuth } from "@/utils/auth.util.js";
import { handleHttpError } from "@/utils/common.util.js";
import { Alert, Box, Button, Checkbox, Flex, LoadingOverlay, Radio, Switch, Text, Title } from "@mantine/core";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router";

const INTERVAL_MS = 1000 * 5;

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const shuffleQuestions = (questions: Question[]): Question[] => {
  const clone = structuredClone(questions);
  return shuffleArray(
    clone.map((q) => ({
      ...q,
      answers: q.answers ? shuffleArray(q.answers) : undefined,
    })),
  );
};

type FormValues = {
  questions: Question[];
};

export default function QuizPage() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [final, setFinal] = useState<Question[] | undefined>();
  const params = useParams<{ id?: string }>();
  const dataQuery = useQuery({
    queryKey: ["quizzes", params.id],
    queryFn: () => getQuiz(params.id),
    refetchInterval: needRefresh ? INTERVAL_MS : undefined,
    refetchIntervalInBackground: true,
  });
  const questions = dataQuery.data?.data?.questions;
  const formMethods = useForm<FormValues>({
    disabled: !!final,
  });
  const formArrayMethods = useFieldArray({
    control: formMethods.control,
    name: "questions",
  });

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    data.questions.forEach((question) => {
      if (!question.selected) return;
      let options: string[] = [];
      if (typeof question.selected === "string") {
        options = [question.selected];
      } else {
        options = question.selected;
      }
      question.answers?.forEach((answer) => {
        answer.selected = options.some((item) => item === String(answer.id));
      });
    });
    setFinal(data.questions);
  };

  const handleReset = () => {
    setFinal(undefined);
    formMethods.clearErrors();
    formMethods.reset({ questions: shuffleQuestions(questions || []) });
  };

  useEffect(() => {
    if (!questions) return;
    formMethods.reset({ questions: shuffleQuestions(questions) });
  }, [questions]);

  useEffect(() => {
    setNeedRefresh(!!dataQuery.data?.data?.isProcessing);
  }, [dataQuery.data?.data?.isProcessing]);

  if (dataQuery.isLoading) {
    return <ScreenLoading visible={dataQuery.isLoading} />;
  }

  if (dataQuery.isError || !dataQuery.data?.data) {
    return <Alert color="red" title="Quiz not found" />;
  }

  return (
    <>
      <title>{dataQuery.data?.data?.title || "Quiz"}</title>

      <Box pos="relative">
        <QuizConfig item={dataQuery.data.data} />
        <Title mb="lg" fz="h3">
          {dataQuery.data?.data?.title}
        </Title>

        <Flex component="form" onSubmit={formMethods.handleSubmit(handleSubmit)} direction="column" gap="xl">
          {(final || formArrayMethods.fields).map((question, i) => {
            const fieldName = `questions.${i}.selected` as const;
            return (
              <Controller
                key={question.id}
                name={fieldName}
                control={formMethods.control}
                rules={{ required: { value: true, message: "Please select an answer" } }}
                render={(fieldProps) => {
                  const correctAnswers = question.answers?.reduce((acc, cur) => acc + (cur.correct ? 1 : 0), 0) || 0;
                  const isMultipleChoice = correctAnswers > 1;
                  const errorMessage = fieldProps.fieldState.error?.message;
                  const isCorrectAnswer =
                    !!final && !!question.answers?.every((item) => !!item.correct === !!item.selected);
                  return (
                    <Flex direction="column" gap="xs">
                      <Text>
                        {final ? (
                          <>
                            {isCorrectAnswer && (
                              <IconCheck
                                color="green"
                                size={16}
                                stroke={3}
                                style={{ display: "inline-block", marginBottom: "-2px" }}
                              />
                            )}
                            {!isCorrectAnswer && (
                              <IconX
                                color="red"
                                size={16}
                                stroke={3}
                                style={{ display: "inline-block", marginBottom: "-2px" }}
                              />
                            )}
                          </>
                        ) : undefined}{" "}
                        {i + 1}. {question.text}
                      </Text>
                      <Flex direction="column" gap="xs">
                        {question.answers?.map((answer) => {
                          const isCorrectAnswer = !!answer.correct;
                          const isIncorrectSelect = !answer.correct && answer.selected;
                          const isCorrect = !!answer.correct && !!answer.selected;
                          const isIncorrect =
                            (!answer.correct && answer.selected) || (!!answer.correct && !answer.selected);
                          return (
                            <Flex
                              key={answer.id}
                              component="label"
                              align="center"
                              gap="xs"
                              c={
                                final ? (isCorrectAnswer ? "green" : isIncorrectSelect ? "red" : undefined) : undefined
                              }
                              fw={final ? (isCorrectAnswer || isIncorrectSelect ? 600 : undefined) : undefined}
                            >
                              {isMultipleChoice ? (
                                <Checkbox size="xs" value={answer.id} {...formMethods.register(fieldName)} />
                              ) : (
                                <Radio size="xs" value={answer.id} {...formMethods.register(fieldName)} />
                              )}
                              <span>{answer.text}</span>
                              {!!final && (
                                <Text span style={{ flexShrink: 0 }}>
                                  {isCorrect && <IconCheck color="green" size={14} />}
                                  {isIncorrect && <IconX color="red" size={14} />}
                                </Text>
                              )}
                            </Flex>
                          );
                        })}
                      </Flex>
                      {!!final && (
                        <Alert title={question.explanation} px="md" py="xs" styles={{ label: { fontWeight: 600 } }} />
                      )}
                      {!!errorMessage && <Alert color="red" px="md" py="xs" title={errorMessage} />}
                    </Flex>
                  );
                }}
              />
            );
          })}
          {!final ? (
            <Button size="md" type="submit">
              Submit
            </Button>
          ) : (
            <Button size="md" type="button" onClick={handleReset}>
              Reset
            </Button>
          )}
        </Flex>
      </Box>
    </>
  );
}

const QuizConfig = (props: { item: QuizDetail }) => {
  const params = useParams<{ id?: string }>();
  const updateMutation = useMutation({
    mutationKey: ["quizzes", params.id],
    mutationFn: updateQuizVisibility,
  });
  const generateMutation = useMutation({
    mutationKey: ["quizzes", params.id],
    mutationFn: generateQuestions,
  });

  const handleSwitch = async (value: boolean) => {
    try {
      await updateMutation.mutateAsync({ id: params.id!, isPublic: value });
    } catch (e) {
      handleHttpError(e);
    }
  };

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({ quizId: params.id || "" });
    } catch (e) {
      handleHttpError(e);
    }
  };

  if (!isAuth()) return null;

  return (
    <Flex justify="space-between" align="center" mb="md">
      <Box pos="relative">
        <LoadingOverlay visible={updateMutation.isPending} />
        <Switch
          checked={props.item.isPublic}
          label="Make this quiz shareable"
          onChange={(e) => handleSwitch(e.target.checked)}
        />
      </Box>
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={handleGenerate}
        loading={generateMutation.isPending || props.item.isProcessing}
      >
        Generate more
      </Button>
    </Flex>
  );
};
