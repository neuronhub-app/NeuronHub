import { Accordion, Spinner, Stack, Text } from "@chakra-ui/react";

import { graphql } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";

const style = {
  heading: {
    fontFamily: "heading",
    fontWeight: "semibold",
    fontSize: "22px",
    lineHeight: "24px",
    color: "brand.black",
  },
  question: {
    fontWeight: "medium",
    fontSize: "14px",
    lineHeight: "19px",
    color: "brand.black.pure",
  },
  answer: {
    fontSize: "13px",
    lineHeight: "19px",
    color: "brand.black",
  },
} as const;

export function JobFaqPage() {
  const query = useApolloQuery(JobFaqQuestionsQuery);

  if (query.isLoadingFirstTime) {
    return <Spinner />;
  }

  return (
    <Stack gap="gap.lg" w="full" pt="30px">
      <Text {...style.heading}>FAQ</Text>

      <Accordion.Root collapsible display="flex" flexDirection="column" gap="gap.sm">
        {query.data?.job_faq_questions.map(item => (
          <Accordion.Item
            key={item.id}
            value={item.id}
            bg="bg.card"
            borderRadius="md"
            borderWidth="1px"
            borderColor="brand.gray"
            overflow="hidden"
            _open={{ borderColor: "brand.green.light" }}
          >
            <Accordion.ItemTrigger
              p="gap.sm"
              justifyContent="space-between"
              alignItems="center"
              {...style.question}
            >
              {item.question}
              <Accordion.ItemIndicator color="brand.black" boxSize="4" />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent px="gap.sm" pt="0" pb="gap.sm" {...style.answer}>
              <Prose
                // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
                dangerouslySetInnerHTML={{
                  __html: markedConfigured.parse(item.answer_md),
                }}
              />
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Stack>
  );
}

const JobFaqQuestionsQuery = graphql.persisted(
  "JobFaqQuestions",
  graphql(`
    query JobFaqQuestions {
      job_faq_questions {
        id
        question
        answer_md
      }
    }
  `),
);
