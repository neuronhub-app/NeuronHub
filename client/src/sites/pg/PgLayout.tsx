import {
  type StackProps,
  Box,
  Container,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";
import { LuMenu, LuMail } from "react-icons/lu";
import {
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
  FaMastodon,
} from "react-icons/fa";
import { SiMatrix, SiSubstack } from "react-icons/si";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { FooterLinkIcon, FooterSectionKind } from "~/graphql/enums";
import { graphql, type ResultOf } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export default function PgLayout() {
  const { data, isLoadingFirstTime } = useApolloQuery(SiteConfigQuery);

  const footer = useFooterSections(data?.site?.footer_sections);

  return (
    <Flex flex="1" direction="column" bg="bg">
      <PgHeroHeader navLinks={data?.site?.nav_links ?? []} isLoading={isLoadingFirstTime} />

      <Stack
        as="main"
        flex="1"
        alignItems="stretch"
        overflow="hidden"
        pb={{ base: "46px", md: "54px" }}
      >
        <Container px={{ base: "gap.sm", md: "6" }}>
          <Outlet />
        </Container>
      </Stack>

      <PgFooter footer={footer} isLoading={isLoadingFirstTime} />
    </Flex>
  );
}

function PgHeroHeader(props: { navLinks: SiteConfig["nav_links"]; isLoading: boolean }) {
  return (
    <Box as="header" bg="brand.green">
      <PgNav navLinks={props.navLinks} isLoading={props.isLoading} />

      <Container
        px={{ base: "gap.sm", md: "88px" }}
        pt={{ base: "30px", md: "14" }}
        pb={{ base: "50px", md: "20" }}
        color="brand.seashell"
        fontWeight="medium"
      >
        <Text
          as="h1"
          fontFamily="heading"
          fontSize={{ base: "26px", md: "6xl" }}
          lineHeight={{ base: "32px", md: "1.2" }}
        >
          Find a job that&apos;s good,
          <br />
          for you{" "}
          <Box
            as="span"
            fontFamily="heading"
            fontStyle="italic"
            fontSize={{ base: "26px", md: "6xl" }}
            lineHeight={{ base: "32px", md: "1.2" }}
          >
            and
          </Box>{" "}
          for the world.
        </Text>
        <Text
          fontSize={{ base: "19px", md: "23px" }}
          lineHeight={{ base: "25px", md: "1.4" }}
          mt={{ base: "4", md: "12" }}
        >
          Curated high-impact jobs for people who want to make a difference.
        </Text>
      </Container>
    </Box>
  );
}

function PgNav(props: { navLinks: SiteConfig["nav_links"]; isLoading: boolean }) {
  const state = useStateValtio({ isMenuOpen: false });

  const isMenuOpen = state.snap.isMenuOpen;

  return (
    <Box position="relative">
      <Container
        px={{ base: "gap.sm", md: "38px" }}
        pt={{ base: "gap.sm", md: "gap.md" }}
        pb={{ md: "gap.md" }}
      >
        <HStack justify="space-between" align="center">
          <NavLink to="/">
            <Image src="/ProbablyGoodLogo.svg" alt="Probably Good" w="121px" h="60px" />
          </NavLink>

          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Menu"
            variant="ghost"
            color="white"
            _icon={{ w: "35px", h: "35px" }}
            onClick={() => {
              state.mutable.isMenuOpen = !state.mutable.isMenuOpen;
            }}
          >
            <LuMenu />
          </IconButton>

          <HStack as="nav" gap="9" display={{ base: "none", md: "flex" }}>
            {props.isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} height="20px" width="80px" />
                ))
              : props.navLinks.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    fontWeight="medium"
                    fontSize="sm"
                    letterSpacing="0.5px"
                    color="white"
                    _hover={{ textDecoration: "underline", textDecorationColor: "white" }}
                  >
                    {link.label}
                  </Link>
                ))}
          </HStack>
        </HStack>
      </Container>

      <Box
        display={{ md: "none" }}
        position="absolute"
        left="0"
        right="0"
        bg="brand.seashell"
        px="gap.sm"
        py="2"
        zIndex="10"
        opacity={isMenuOpen ? 1 : 0}
        transform={isMenuOpen ? "translateY(0)" : "translateY(-8px)"}
        pointerEvents={isMenuOpen ? "auto" : "none"}
        transition="opacity 0.2s ease, transform 0.2s ease"
      >
        {props.navLinks.map(link => (
          <Link
            key={link.label}
            href={link.href}
            display="block"
            fontWeight="medium"
            fontSize="sm"
            letterSpacing="0.5px"
            color="brand.black"
            py="3"
            _hover={{ textDecoration: "underline", textDecorationColor: "brand.black" }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
}

function PgFooter(props: { footer: FooterData; isLoading: boolean }) {
  const footerLinkStyle = {
    color: "brand.footer.text",
    _hover: { textDecoration: "underline" },
  } as const;

  return (
    <Box as="footer" bg="brand.footer.bg" color="brand.seashell" minH={{ md: "450px" }}>
      <Container
        pl={{ base: "gap.sm", md: "58px" }}
        pr={{ base: "gap.sm", md: "gap.lg" }}
        pt={{ base: "22px", md: "46px" }}
      >
        <Grid
          templateColumns={{
            base: "1fr",
            md: `2fr${" 1fr".repeat(props.footer.columns.length)}`,
          }}
          gap={{ base: "gap.sm", md: "30px" }}
        >
          <FooterDescription
            isLoading={props.isLoading}
            socialLinks={props.footer.socialLinks}
          />

          {props.footer.columns.map((section, index) => (
            <FooterSectionColumn
              key={section.id}
              title={section.title}
              links={section.links}
              isLoading={props.isLoading}
              chakra={{ mt: { base: index === 0 ? "1.5" : "0", md: "0" } }}
            />
          ))}
        </Grid>
      </Container>

      <Container px="0">
        <Separator
          mt={{ base: "5", md: "14" }}
          mb={{ base: "5", md: "0" }}
          mx={{ base: "gap.sm", md: "50px" }}
          borderColor="brand.seashell"
        />

        <HStack
          justify="center"
          flexWrap="wrap"
          columnGap={{ base: "gap.xs", md: "1" }}
          rowGap={{ base: "0.5", md: "1" }}
          h={{ base: "70px", md: "55px" }}
          px={{ base: "gap.sm", md: "50px" }}
          pb={{ base: "22px", md: "0" }}
          color="brand.footer.text"
          fontSize="sm"
        >
          <HStack gap="1">
            <Text>© {new Date().getFullYear()} </Text>
            <Link href="https://probablygood.org/about/" {...footerLinkStyle}>
              Probably Good
            </Link>
            <Text>|</Text>
          </HStack>
          {props.footer.bottomLinks.map((link, index) => (
            <HStack key={link.label} gap="1">
              <Link href={link.href} {...footerLinkStyle}>
                {link.label}
              </Link>
              {index < props.footer.bottomLinks.length - 1 && <Text>|</Text>}
            </HStack>
          ))}
        </HStack>
      </Container>
    </Box>
  );
}

function FooterDescription(props: { socialLinks: FooterSection["links"]; isLoading: boolean }) {
  // todo ! fix: restore from Figma design (or fix UI to match)
  // { src: "/email-icon.svg" },
  // { src: "/linkedin-icon.svg" },

  const icons = {
    [FooterLinkIcon.Email]: <LuMail />,
    [FooterLinkIcon.Linkedin]: <FaLinkedinIn />,
    [FooterLinkIcon.Github]: <FaGithub />,
    [FooterLinkIcon.Youtube]: <FaYoutube />,
    [FooterLinkIcon.Twitter]: <FaTwitter />,
    [FooterLinkIcon.Facebook]: <FaFacebookF />,
    [FooterLinkIcon.Instagram]: <FaInstagram />,
    [FooterLinkIcon.Discord]: <FaDiscord />,
    [FooterLinkIcon.Mastodon]: <FaMastodon />,
    [FooterLinkIcon.Matrix]: <SiMatrix />,
    [FooterLinkIcon.Substack]: <SiSubstack />,
  } as const;

  return (
    <Stack gap="3.5">
      <Text fontFamily="heading" fontWeight="medium" fontSize={{ base: "20px", md: "26px" }}>
        <Box as="span" fontStyle="italic">
          Probably Good
        </Box>{" "}
        is a nonprofit
        <br />
        that empowers people to do
        <br />
        good with their careers.
      </Text>

      <HStack gap="3.5">
        {props.isLoading
          ? [1, 2].map(index => (
              <Skeleton key={index} width="8" height="8" borderRadius="full" />
            ))
          : props.socialLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.1)" }}
              >
                <Icon w="8" h="8" color="brand.seashell">
                  {icons[link.icon as FooterLinkIcon] ?? <LuMail />}
                </Icon>
              </Link>
            ))}
      </HStack>
    </Stack>
  );
}

function FooterSectionColumn(props: {
  title: string;
  links: FooterSection["links"];
  isLoading: boolean;
  chakra?: StackProps;
}) {
  const style = {
    link: {
      fontWeight: "medium",
      fontSize: "md",
      lineHeight: "25.92px",
      color: "brand.seashell",
      _hover: { textDecoration: "underline" },
    },
  } as const;

  return (
    <Stack gap="gap.xs" {...props.chakra}>
      <Text
        fontFamily="heading"
        fontWeight="semibold"
        fontSize="19px"
        lineHeight="30.24px"
        color="brand.footer.heading"
      >
        {props.title}
      </Text>

      <Stack gap={{ base: "gap.xs", md: "3" }}>
        {props.isLoading
          ? [1, 2, 3].map(index => <Skeleton key={index} height="26px" width="120px" />)
          : props.links.map(link => (
              <Link key={link.label} href={link.href} {...style.link}>
                {link.label}
              </Link>
            ))}
      </Stack>
    </Stack>
  );
}

function useFooterSections(sections?: FooterSection[]): FooterData {
  const sectionsByEnum = {} as Record<FooterSectionKind, FooterSection[]>;

  for (const enumValue of Object.values(FooterSectionKind)) {
    sectionsByEnum[enumValue] = [];
  }
  for (const section of sections ?? []) {
    sectionsByEnum[section.kind as FooterSectionKind]?.push(section);
  }
  return {
    columns: sectionsByEnum[FooterSectionKind.Column],
    socialLinks: sectionsByEnum[FooterSectionKind.Social]?.[0]?.links ?? [],
    bottomLinks: sectionsByEnum[FooterSectionKind.Bottom]?.[0]?.links ?? [],
  };
}

const SiteConfigQuery = graphql.persisted(
  "SiteConfigQuery",
  graphql(`
    query SiteConfigQuery {
      site {
        nav_links {
          id
          label
          href
        }
        footer_sections {
          id
          kind
          title
          links {
            id
            label
            href
            icon
          }
        }
      }
    }
  `),
);

type SiteConfig = NonNullable<ResultOf<typeof SiteConfigQuery>["site"]>;

type FooterSection = SiteConfig["footer_sections"][number];

type FooterData = {
  columns: FooterSection[];
  socialLinks: FooterSection["links"];
  bottomLinks: FooterSection["links"];
};
