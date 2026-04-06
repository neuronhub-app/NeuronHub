import { FaGear } from "react-icons/fa6";
import { FiLayout } from "react-icons/fi";
import {
  GoArchive,
  GoBell,
  GoBriefcase,
  GoComment,
  GoCommentDiscussion,
  GoEyeClosed,
  GoGear,
  GoMoon,
  GoPeople,
  GoQuestion,
  GoSun,
  GoTag,
  GoTools,
} from "react-icons/go";
import { IoInvertMode } from "react-icons/io5";
import { LuChevronLeft, LuChevronRight, LuShieldAlert, LuWrench } from "react-icons/lu";

/**
 * Use this object to keep icons consistent.
 *
 * Add `_fill` to filled icons.
 *
 * Preferable icons, in order:
 * - Github, Feather, Lucide
 * - FontAwesome (for filled), Bootstrap
 *
 * Avoid:
 * - Material Design
 *
 * LLM prompts (for later):
 * - add all icons used in more than 1 file, of the same entity/action.
 * - todo ? build: check tree-shaking (due to icons `import`).
 */
export const icons = {
  settings: GoGear,
  settings_2: LuWrench,

  mode_light: GoSun,
  mode_dark: GoMoon,
  mode_system: IoInvertMode,

  chevron_right: LuChevronRight,
  chevron_left: LuChevronLeft,

  get admin() {
    return this.settings;
  },
  admin_fill: FaGear,

  docs: GoQuestion,
  sentry: LuShieldAlert,

  // Models
  site_config: FiLayout,
  users: GoPeople,
  job_alert: GoBell,
  job: GoBriefcase,
  get profiles() {
    return this.users;
  },
  posts: GoCommentDiscussion,
  reviews: GoComment,
  tools: GoTools,
  tags: GoTag,
  library: GoArchive,

  // actions
  hide: GoEyeClosed,
} as const;
