interface FriendlyError {
  title: string;
  message: string;
  reasons?: string[];
}

export function toFriendlyError(raw: string | null | undefined): FriendlyError {
  const text = (raw ?? "").toLowerCase();

  if (!raw) {
    return {
      title: "Something went wrong",
      message: "Please try again in a moment.",
    };
  }

  if (text.includes("could not crawl") || text.includes("couldn't reach")) {
    return {
      title: "We couldn't reach this website",
      message: "Check the URL and try again.",
      reasons: [
        "The domain may be misspelled or offline",
        "A firewall or bot protection may be blocking our crawler",
        "The site may require login before pages load",
      ],
    };
  }

  if (text.includes("timed out") || text.includes("timeout")) {
    return {
      title: "This audit took too long",
      message: "The site may be slow or blocking automated requests.",
      reasons: [
        "Try again with your homepage URL only",
        "Very large sites may exceed the 5-minute limit",
        "Check if the site is temporarily down",
      ],
    };
  }

  if (text.includes("invalid url") || text.includes("url is required")) {
    return {
      title: "That URL doesn't look right",
      message: "Enter a full website address like https://yoursite.com.",
    };
  }

  if (text.includes("job not found") || text.includes("job was lost")) {
    return {
      title: "This audit session expired",
      message: "Run a new audit — sessions reset if the server restarts.",
    };
  }

  if (text.includes("lost connection") || text.includes("fetch")) {
    return {
      title: "Connection interrupted",
      message: "Keep this tab open and try running the audit again.",
    };
  }

  if (text.includes("openai") || text.includes("api key")) {
    return {
      title: "AI recommendations unavailable",
      message: raw,
      reasons: [
        "Check that your OpenAI key starts with sk-",
        "You still get the full technical audit without a key",
      ],
    };
  }

  return {
    title: "We couldn't complete the audit",
    message: raw,
    reasons: [
      "Verify the URL loads in your browser",
      "Try again in a few minutes if the site was temporarily down",
    ],
  };
}
