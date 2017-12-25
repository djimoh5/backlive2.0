export interface RssFeed {
	title: string;
	description: string;
	url: string;
	items: RssItem[];
}

export interface RssItem {
	title: string;
	description?: string;
	link?: string;
	url?: string;
	created?: number;
}