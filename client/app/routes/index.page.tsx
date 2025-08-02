import { getQuizzes } from "@/api/quiz.api.js";
import { useQuery } from "@tanstack/react-query";

export const meta = () => {
  return [{ title: "Home" }];
};

export default function IndexPage() {
  const queryData = useQuery({
    queryKey: ["quizzes"],
    queryFn: getQuizzes,
  });

  return (
    <div>
      {JSON.stringify(queryData.data)}
    </div>
  );
}
