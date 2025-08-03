import { getQuiz } from "@/api/quiz.api.js";
import { ScreenLoading } from "@/components/screen-loading.js";
import type { Question } from "@/type/quiz.type.js";
import { Alert, Box, Button, Checkbox, Flex, Radio, Text, Title } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
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
  const dataQuery = useQuery({
    queryKey: ["quizzes", params.id],
    queryFn: () => getQuiz(params.id),
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
    formMethods.reset({ questions });
  };

  useEffect(() => {
    if (questions) {
      formMethods.reset({ questions });
    }
  }, [questions]);

  if (dataQuery.isLoading) {
    return <ScreenLoading visible={dataQuery.isLoading} />;
  }

  return (
    <Box pos="relative">
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
                      {!!final ? (
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
                            component="label"
                            align="center"
                            gap="xs"
                            key={answer.id}
                            c={final ? (isCorrectAnswer ? "green" : isIncorrectSelect ? "red" : undefined) : undefined}
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
  );
}
