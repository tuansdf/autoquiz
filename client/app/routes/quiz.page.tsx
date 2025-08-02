import { getQuiz } from "@/api/quiz.api.js";
import { ScreenLoading } from "@/components/screen-loading.js";
import type { Question } from "@/type/quiz.type.js";
import { Alert, Box, Button, Checkbox, Flex, Radio, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router";

export const meta = () => {
  return [{ title: "Quiz" }];
};

type FormValues = {
  questions: Question[];
};

export default function QuizPage() {
  const [final, setFinal] = useState<Question[] | undefined>();
  const params = useParams<{ id?: string }>();
  const queryData = useQuery({
    queryKey: ["quizzes", params.id],
    queryFn: () => getQuiz(params.id),
  });
  const questions = queryData.data?.data?.questions;
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
    formMethods.reset({ questions });
  };

  useEffect(() => {
    if (questions) {
      formMethods.reset({ questions });
    }
  }, [questions]);

  return (
    <>
      <Box pos="relative">
        <Title mb="md" fz="h3">
          {queryData.data?.data?.title}
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
                  return (
                    <Flex direction="column" gap="xs">
                      <Text>
                        {i + 1}. {question.question}
                      </Text>
                      <Flex direction="column" gap="xs">
                        {question.answers?.map((answer) => {
                          const isCorrect = !!answer.correct;
                          const isWrong = !answer.correct && answer.selected;
                          return (
                            <Flex
                              component="label"
                              align="center"
                              gap="xs"
                              key={answer.id}
                              c={final ? (isCorrect ? "green" : isWrong ? "red" : undefined) : undefined}
                              fw={final ? (isCorrect || isWrong ? 600 : undefined) : undefined}
                            >
                              {isMultipleChoice ? (
                                <Checkbox size="xs" value={answer.id} {...formMethods.register(fieldName)} />
                              ) : (
                                <Radio size="xs" value={answer.id} {...formMethods.register(fieldName)} />
                              )}
                              {answer.text}
                            </Flex>
                          );
                        })}
                      </Flex>
                      {!!final && <Alert title={question.explanation} px="md" py="xs" />}
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

      <ScreenLoading visible={queryData.isLoading} />
    </>
  );
}
