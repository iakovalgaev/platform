import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		environment: "node",
		pool: "forks",
	},
	plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
});
