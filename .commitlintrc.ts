import { execSync } from "node:child_process";

export default {
	parserPreset: {
		parserOpts: {
			headerPattern: /^([A-Z]+-\d+)(?:\(([^)]*)\))?: (.+)$/,
			headerCorrespondence: ["type", "scope", "subject"],
		},
	},
	plugins: [
		{
			rules: {
				"branch-ticket-match": (parsed) => {
					const ticket = getBranchTicket();
					if (!ticket) return [true, ""];
					if (parsed.type !== ticket) {
						return [
							false,
							`Commit type must match branch ticket: expected "${ticket}", got "${parsed.type ?? "empty"}"`,
						];
					}
					return [true, ""];
				},
			},
		},
	],
	rules: {
		"branch-ticket-match": [2, "always"],
		"type-empty": [2, "never"],
		"subject-empty": [2, "never"],
		"header-max-length": [2, "always", 80],
		"subject-case": [0],
	},
};

function getBranchTicket(): string | null {
	try {
		const branch = execSync("git branch --show-current", {
			encoding: "utf-8",
		}).trim();
		const match = branch.match(/^([A-Z]+-\d+)\//);
		return match ? match[1] : null;
	} catch {
		return null;
	}
}
