import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./style.css";

// Content
import MarkdownDirectory from "./terms-and-conditions.md";

export default function TermsAndConditions(props) {
	const [markdown, setMarkdown] = useState('');

	// useEffect with an empty dependency array (`[]`) runs only once
	useEffect(() => {
		fetch(MarkdownDirectory)
			.then((response) => response.text())
			.then(setMarkdown);
	}, []);

	return (
		<ReactMarkdown children={markdown} />
	);
}