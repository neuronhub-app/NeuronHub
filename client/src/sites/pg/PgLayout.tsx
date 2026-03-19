import {
  type BoxProps,
  type StackProps,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Image,
  Link,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";
import { LuMenu } from "react-icons/lu";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

export default function PgLayout() {
  return (
    <Flex flex="1" direction="column" bg="bg">
      <PgHeroHeader />

      <Stack as="main" flex="1" alignItems="stretch">
        <Container pb="gap.xl" px={{ base: "gap.sm", md: "6" }}>
          <Outlet />
        </Container>
      </Stack>
      <PgFooter />
    </Flex>
  );
}

function PgHeroHeader() {
  return (
    <Box as="header" bg="brand.green" minH={{ base: "325px", md: "600px" }}>
      <PgNav />
      <Container
        px={{ base: "gap.sm", md: "88px" }}
        py={{ base: "30px", md: "56px" }}
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

const NAV_LINKS = [
  { label: "Career Guide", href: "https://probablygood.org/career-guide/" },
  { label: "Career Profiles", href: "https://probablygood.org/career-profiles/" },
  { label: "Job Board", href: "https://jobs.probablygood.org/" },
  { label: "Explore", href: "https://probablygood.org/explore/" },
  { label: "Advising", href: "https://probablygood.org/advising/" },
  { label: "About", href: "https://probablygood.org/about/" },
] as const;

function PgNav() {
  const state = useStateValtio({ isMenuOpen: false });

  function toggleMenu() {
    state.mutable.isMenuOpen = !state.mutable.isMenuOpen;
  }

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
            onClick={toggleMenu}
          >
            <LuMenu />
          </IconButton>

          <HStack as="nav" gap="9" display={{ base: "none", md: "flex" }}>
            {NAV_LINKS.map(link => (
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
        {NAV_LINKS.map(link => (
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

const FOOTER_LINKS = {
  Content: [
    { label: "Career Guide", href: "https://probablygood.org/career-guide/" },
    { label: "Career Profiles", href: "https://probablygood.org/career-profiles/" },
    { label: "Cause Areas", href: "https://probablygood.org/cause-areas/" },
    { label: "Degree Paths", href: "https://probablygood.org/degree-paths/" },
    { label: "Core Concepts", href: "https://probablygood.org/core-concepts/" },
    { label: "Interviews", href: "https://probablygood.org/interviews/" },
    { label: "Explore", href: "https://probablygood.org/explore/" },
  ],
  Services: [
    { label: "1:1 Advising", href: "https://probablygood.org/advising/" },
    { label: "Job Board", href: "https://jobs.probablygood.org/" },
    { label: "Workshops", href: "https://probablygood.org/workshops/" },
  ],
  About: [
    { label: "Learn more", href: "https://probablygood.org/about/" },
    { label: "Get in touch", href: "https://probablygood.org/contact/" },
    { label: "Donate", href: "https://probablygood.org/donate/" },
  ],
} as const;

const FOOTER_BOTTOM_LINKS = [
  { label: "Privacy Policy", href: "https://probablygood.org/privacy-policy/" },
  { label: "Terms of Service", href: "https://probablygood.org/terms-of-service/" },
  { label: "Cookie Preferences", href: "https://probablygood.org/about/#manage_cookies" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://probablygood.org/newsletter/", src: "/email-icon.svg", alt: "Email" },
  {
    href: "https://www.linkedin.com/company/probably-good/",
    src: "/linkedin-icon.svg",
    alt: "LinkedIn",
  },
] as const;

function PgFooter() {
  const footerLinkStyle = {
    color: "brand.footer.text",
    _hover: { textDecoration: "underline" },
  } as const;
  const currentYear = new Date().getFullYear();

  return (
    <Box as="footer" bg="brand.footer.bg" color="brand.seashell" minH={{ md: "450px" }}>
      <Container
        pl={{ base: "gap.sm", md: "58px" }}
        pr={{ base: "gap.sm", md: "gap.lg" }}
        pt={{ base: "22px", md: "46px" }}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }}
          gap={{ base: "gap.sm", md: "30px" }}
        >
          <FooterDescription />

          {Object.entries(FOOTER_LINKS).map((entry, index) => {
            const mtBase = index === 0 ? "1.5" : "0";
            return (
              <FooterColumn
                key={entry[0]}
                title={entry[0]}
                links={entry[1]}
                chakra={{ mt: { base: mtBase, md: "0" } }}
              />
            );
          })}
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
            <Text>© {currentYear} </Text>
            <Link href="https://probablygood.org/about/" {...footerLinkStyle}>
              Probably Good
            </Link>
            <Text>|</Text>
          </HStack>
          {FOOTER_BOTTOM_LINKS.map((link, index) => (
            <HStack key={link.label} gap="1">
              <Link href={link.href} {...footerLinkStyle}>
                {link.label}
              </Link>
              {index < FOOTER_BOTTOM_LINKS.length - 1 && <Text>|</Text>}
            </HStack>
          ))}
        </HStack>
      </Container>
    </Box>
  );
}

function FooterDescription() {
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
        {SOCIAL_LINKS.map(link => (
          <Link
            key={link.alt}
            href={link.href}
            transition="transform 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          >
            <Image src={link.src} alt={link.alt} w="8" h="8" />
          </Link>
        ))}
      </HStack>
    </Stack>
  );
}

function FooterColumn(props: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
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
        {props.links.map(link => (
          <Link key={link.label} href={link.href} {...style.link}>
            {link.label}
          </Link>
        ))}
      </Stack>
    </Stack>
  );
}
