import compassMeridianIcon from "../assets/project-icons/compass-meridian-icon.png";
import jsosLogo from "../assets/jsOS Logo.png";
import gighubLandingPage from "../assets/project-previews/gighub-landing-page.png";
import gighubSearchPage from "../assets/project-previews/gighub-search.png";
import gighubDashboardPage from "../assets/project-previews/gighub-dashboard.png";
import jsosDesktopScreen from "../assets/project-previews/jsos-desktop-screen.png";
import jsosBiosScreen from "../assets/project-previews/jsos-bios-screen.png";
import jsosLoadingScreen from "../assets/project-previews/jsos-loading-screen.png";
import meridianDashboardPage from "../assets/project-previews/meridian-dashboard-page.png";
import meridianMappingPage from "../assets/project-previews/meridian-mapping-page.png";
import meridianHelpPage from "../assets/project-previews/meridian-help-page.png";

export type Project = {
	id: string;
	icon: string;
	name: string;
	description: string;
	technologies: string[];
	repositoryUrl?: string;
	gif?: string;
	screenshots?: string[];
	url?: string;
	openInNewTab?: boolean;
};

export const projects: Project[] = [
	{
		id: "compass-meridian",
		icon: compassMeridianIcon,
		name: "Compass Meridian",
		description: "A Windows desktop configuration app for the Klutch Gaming Compass that gives players a native control center for customizing key mappings, tuning directional and diagonal deadzones, managing up to ten custom profiles, monitoring device information, and handling firmware-oriented device workflows over USB serial. The app is built with JavaFX and designed to feel lightweight and responsive while still covering real hardware concerns like auto-connect, hotplug behavior, and profile persistence.",
		gif: meridianDashboardPage,
		screenshots: [meridianDashboardPage, meridianMappingPage, meridianHelpPage],
		repositoryUrl: "https://github.com/juviscript/compass-meridian",
		technologies: ["Java", "JavaFX", "FXML", "Maven", "jSerialComm"],
	},
	{
		id: "portfolio-website",
		icon: jsosLogo,
		name: "jsOS: Interactive Portfolio",
		description: "An interactive portfolio experience built to feel like exploring a fictional operating system rather than browsing a traditional website. This project required strong front-end engineering skills in component architecture, responsive design, state-driven UI behavior, and reusable data modeling, along with a product-minded approach to interaction design, visual theming, accessibility, and user flow. It brings together desktop-style window management, mobile-specific navigation patterns, project galleries, widgets, boot sequences, and content-driven app views to showcase both technical implementation and creative interface thinking.",
		gif: jsosDesktopScreen,
		screenshots: [jsosDesktopScreen, jsosBiosScreen, jsosLoadingScreen],
		repositoryUrl: "https://github.com/yourusername/portfolio-website",
		technologies: ["Vue.js", "TypeScript"],
	},
	{
		id: "gighub",
		icon: "http://gighub-env.eba-nptndmmf.us-east-2.elasticbeanstalk.com/images/gighub-logo.png",
		name: "GigHub",
		description: "A software engineering capstone project built as a full-stack concert-tracking platform where users can discover live events, save shows they want to attend, keep a history of concerts they have seen, and document those experiences with notes, ratings, and uploaded photos. Under the hood, the app uses a Spring Boot architecture with MVC controllers, Thymeleaf views, Spring Security, JPA-backed persistence, MySQL, and Ticketmaster API integration for event discovery, with AWS S3 handling photo uploads and AWS Elastic Beanstalk used for deployment. The project also includes reporting-oriented backend features, including PDF generation, which made it a strong exercise in tying together UI, API consumption, persistence, authentication, cloud services, and deployment workflows.",
		gif: gighubLandingPage,
		screenshots: [gighubLandingPage, gighubSearchPage, gighubDashboardPage],
		url: "http://gighub-env.eba-nptndmmf.us-east-2.elasticbeanstalk.com/",
		openInNewTab: true,
		technologies: ["Java", "Spring Boot", "Thymeleaf", "Spring Security", "JPA", "MySQL", "AWS S3", "AWS Elastic Beanstalk", "Ticketmaster API"],
	},
];
