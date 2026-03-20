import { Accordion, Link, Stack, Text } from "@chakra-ui/react";

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
  link: {
    fontWeight: "medium",
    fontSize: "13px",
    lineHeight: "19px",
    color: "brand.green.light",
  },
} as const;

export function JobFaqPage() {
  return (
    <Stack gap="gap.lg" w="full" pt="30px">
      <Text {...style.heading}>FAQ</Text>

      <Accordion.Root collapsible display="flex" flexDirection="column" gap="gap.sm">
        {FAQ_ITEMS.map(item => (
          <Accordion.Item
            key={item.value}
            value={item.value}
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
              {item.answer}
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Stack>
  );
}

const FAQ_ITEMS = [
  {
    value: "roles-selected",
    question: "How are roles selected for the board?",
    answer: (
      <Stack gap="3">
        <Text>
          Our goal is to feature promising roles working on the world's most important{" "}
          <Link href="https://probablygood.org/cause-areas/" {...style.link}>
            global problems
          </Link>
          . To that end, we only include roles from organizations that we estimate to meet a
          meaningful bar for impact. We source organizations primarily through our own internal
          research, while also drawing on other signals for impact like recommendations from
          rigorous{" "}
          <Link
            href="https://probablygood.org/core-concepts/effective-giving/#Charity_evaluators"
            {...style.link}
          >
            charity evaluators
          </Link>
          , support from impact-focused philanthropic foundations, and endorsements from experts.
          We also filter for different roles within organizations, only including opportunities
          from particularly impactful departments or teams where relevant.
        </Text>
        <Text>
          That said, estimating impact is genuinely difficult, and we have real uncertainty about
          many of the organizations and roles we include. A role appearing on the board isn't a
          guarantee of impact, nor necessarily an endorsement of that organization's broader
          mission, practices, or culture. There are also likely strong opportunities we haven't
          come across yet or had the capacity to review. If you think a role or organization
          should or shouldn't be on the board, we'd love to{" "}
          <Link href="https://probablygood.org/contact/" {...style.link}>
            hear from you
          </Link>
          .
        </Text>
        <Text>
          Note that we include some roles primarily for the skills, experience, and connections
          they offer rather than their direct impact. These are assigned the{" "}
          <Link href="https://probablygood.org/core-concepts/career-capital/" {...style.link}>
            career capital
          </Link>{" "}
          label.
        </Text>
      </Stack>
    ),
  },
  {
    value: "highlighted-org",
    question: "What does the 'highlighted org' label mean?",
    answer: (
      <Text>
        Roles marked with a <em>highlighted org</em> tag are roles within organizations that
        we've identified as doing particularly impactful or promising work. These organizations
        tend to have at least one of these characteristics: they receive recommendations from
        rigorous{" "}
        <Link
          href="https://probablygood.org/core-concepts/effective-giving/#Charity_evaluators"
          {...style.link}
        >
          charity evaluators
        </Link>
        , have significant support from impact-focused foundations, operate in a{" "}
        <Link href="https://probablygood.org/cause-areas/" {...style.link}>
          cause area
        </Link>{" "}
        we consider particularly high priority, or use methods or interventions we believe to be{" "}
        <Link href="https://probablygood.org/core-concepts/method-efficacy/" {...style.link}>
          especially impactful
        </Link>
        . That said, although we have more confidence in highlighted orgs than others on the
        board, impact is genuinely difficult to assess, and we still have uncertainties about
        potential impact within these orgs.
      </Text>
    ),
  },
  {
    value: "career-capital",
    question: "What does the 'career capital' label mean?",
    answer: (
      <Text>
        Career capital roles are opportunities we recommend primarily for the skills, experience,
        and connections they offer, rather than their direct impact. We think investing in the{" "}
        <Link href="https://probablygood.org/core-concepts/career-capital/" {...style.link}>
          right career capital
        </Link>{" "}
        early on is often the best path to long-term impact, positioning you for more influential
        roles later in your career.
      </Text>
    ),
  },
  {
    value: "list-vacancies",
    question: "How can I list my vacancies on the board?",
    answer: (
      <Stack gap="3">
        <Text>
          If you're interested in getting your role featured on the board, you can fill out{" "}
          <Link href="https://probablygood.org/contact/" {...style.link}>
            this form
          </Link>
          . Your submission will be reviewed by our team, and if we think you're a good fit for
          the board, we'll get back to you.
        </Text>
        <Text>
          Note that Probably Good's job board is selective; we vet all organizations and roles we
          feature, and many aren't a good fit for the board. Before submitting, it's worth
          checking whether your organization works within the{" "}
          <Link href="https://probablygood.org/cause-areas/" {...style.link}>
            cause areas
          </Link>{" "}
          we prioritize, as we rarely list organizations outside of these. Working within these
          cause areas doesn't guarantee inclusion, but it's a strong signal that your
          organization might be a good fit.
        </Text>
      </Stack>
    ),
  },
  {
    value: "find-jobs",
    question: "Where else can I find impactful jobs?",
    answer: (
      <Text>
        We try to include as many impactful roles and organizations as we can, but there are
        likely strong opportunities not yet on the board. We recommend checking other job boards
        alongside ours, particularly if you're based in a non-English speaking region where our
        coverage is usually more limited. We've put together a{" "}
        <Link href="https://probablygood.org/resources/job-boards/" {...style.link}>
          list of other relevant job boards
        </Link>{" "}
        to help.
      </Text>
    ),
  },
  {
    value: "contact",
    question: "How can I get in touch about the job board?",
    answer: (
      <Text>
        If you have any feedback, questions, or suggestions of organizations to include on the
        job board, please{" "}
        <Link href="https://probablygood.org/contact/" {...style.link}>
          get in touch
        </Link>
        !
      </Text>
    ),
  },
  {
    value: "career-help",
    question: "Can you help me figure out what to do with my career?",
    answer: (
      <Stack gap="3">
        <Text>
          Yes! As a nonprofit that helps people build fulfilling and impactful careers, the job
          board is just one part of what we offer here at{" "}
          <Link href="https://probablygood.org/" {...style.link}>
            Probably Good
          </Link>
          . If you're still figuring out your career direction, our{" "}
          <Link href="https://probablygood.org/career-guide/" {...style.link}>
            career guide
          </Link>{" "}
          is a good place to start; it walks you through the process of finding a high-impact
          career that fits your skills, interests, and values. We also have{" "}
          <Link href="https://probablygood.org/explore/" {...style.link}>
            loads of other content
          </Link>
          , like{" "}
          <Link href="https://probablygood.org/career-profiles/" {...style.link}>
            career profiles
          </Link>{" "}
          that offer deeper dives into specific paths,{" "}
          <Link href="https://probablygood.org/cause-areas/" {...style.link}>
            cause area
          </Link>{" "}
          articles that highlight important global problems, and{" "}
          <Link href="https://probablygood.org/interviews/" {...style.link}>
            interviews
          </Link>{" "}
          with professionals who have had impactful careers.
        </Text>
        <Text>
          If you're interested in more personalised support, we also offer an impact-focused{" "}
          <Link href="https://probablygood.org/advising/" {...style.link}>
            1:1 advising service
          </Link>{" "}
          to help you navigate the next stage of your career.
        </Text>
        <Text>
          Note that we're funded by grants, so all our services are completely free; our only
          goal is to help you make a difference.
        </Text>
      </Stack>
    ),
  },
] as const;
