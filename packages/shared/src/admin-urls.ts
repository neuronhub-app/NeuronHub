import { env } from "@neuronhub/shared/createEnv";

const baseUrl = env.VITE_SERVER_URL as
  | "https://backend.neuronhub.app"
  | "https://backend.jobs.probablygood.org"
  | "https://stage.backend.neuronhub.app"
  | "https://pg.stage.backend.neuronhub.app"
  | "localhost";

const adminUrl = `${baseUrl}/admin` as const;

export const admin = {
  urls: {
    home: `${adminUrl}/`,
    site_config: `${adminUrl}/sites/siteconfig/`,
    jobs: `${adminUrl}/jobs/job/`,
    job_alerts: `${adminUrl}/jobs/jobalert/`,
    tags: `${adminUrl}/posts/posttag/`,
    users: `${adminUrl}/users/user/`,
    task_results: `${adminUrl}/django_tasks_database/dbtaskresult/`,
  },
} as const;
