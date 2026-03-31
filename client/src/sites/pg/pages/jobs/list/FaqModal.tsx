import { Accordion, Skeleton, Stack } from "@chakra-ui/react";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import type { ReactNode } from "react";
import {
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { graphql } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export function FaqModal(props: { children: ReactNode }) {
  const state = useStateValtio({ isOpen: false });
  const query = useApolloQuery(JobFaqQuestionsQuery, undefined, { skip: !state.snap.isOpen });

  return (
    <DialogRoot
      size="lg"
      open={state.snap.isOpen}
      onOpenChange={event => {
        state.mutable.isOpen = event.open;
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>

      <DialogContent bg="bg" gap="gap.md" p={{ base: "gap.md", md: "gap.xl" }}>
        <DialogHeader p="0">
          <DialogTitle {...style.heading}>FAQ</DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger
          top={{ base: "gap.md", md: "gap.xl" }}
          right={{ base: "gap.md", md: "gap.xl" }}
          color="brand.green"
        />

        {query.isLoadingFirstTime ? (
          <Stack gap="gap.sm">
            {[1, 2, 3, 4, 5].map(index => (
              <Skeleton key={index} h="13" borderRadius="md" />
            ))}
          </Stack>
        ) : (
          <Accordion.Root
            collapsible
            multiple
            display="flex"
            flexDirection="column"
            gap="gap.sm"
          >
            {query.data?.job_faq_questions.map(item => (
              <Accordion.Item key={item.id} value={item.id} {...style.item}>
                <Accordion.ItemTrigger {...style.itemTrigger} className="group">
                  {item.question}
                  <Accordion.ItemIndicator
                    color="fg.muted"
                    boxSize="4"
                    _open={{ color: "brand.black" }}
                    _groupHover={{ color: "brand.black" }}
                  />
                </Accordion.ItemTrigger>

                <Accordion.ItemContent px="gap.sm" pt="0" pb="gap.sm">
                  <Prose
                    maxW="none"
                    css={{ ...style.answer, "& a": style.link }}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
                    dangerouslySetInnerHTML={{
                      __html: markedConfigured.parse(item.answer_md),
                    }}
                  />
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

const style = {
  heading: {
    fontFamily: "heading",
    fontWeight: "semibold",
    fontSize: "22px",
    lineHeight: "36px",
    color: "brand.black",
  },
  item: {
    bg: "bg.card",
    borderRadius: "md",
    borderWidth: "1px",
    borderColor: "brand.gray",
    overflow: "hidden",
    flexShrink: 0,
    _open: { borderColor: "brand.black" },
    css: {
      "&:has(button:hover)": { borderColor: "brand.black" },
      "&[data-state=open]:has(button:hover)": { boxShadow: "0 0 0 1px {colors.brand.black}" },
    },
  },
  itemTrigger: {
    p: "gap.sm",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "medium",
    fontSize: "sm",
    lineHeight: "19px",
    color: "brand.black",
    cursor: "pointer",
  },
  answer: {
    fontSize: "14px",
    lineHeight: "21px",
    color: "brand.black",
  },
  link: {
    fontWeight: "medium",
    fontSize: "13px",
    lineHeight: "19px",
    color: "brand.green.light",
    textDecoration: "none",
    _hover: { textDecoration: "underline", textDecorationColor: "brand.green.light" },
  },
} as const;

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
