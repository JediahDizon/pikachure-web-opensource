const UserBasic = {
	"id": "ec8cc49c-55bd-411b-9aac-a0c330c2be3e",
	"name": "Friscc",
	"tag": "friscc"
};

const UserHost = {
	"id": "0d94572f-6f9d-43a3-94d7-76eb167ddc7f",
	"name": "Jediah Dizon",
	"tag": "jediahdizon"
};

const Comment = {
	"id": "0d94572f-6f9d-43a3-94d7-76eb167ddc7f",
	"user": UserBasic,
	"description": "Awesome!",
	"datePublished": "2021-11-01T05:17:14.915Z"
};

const Note = {
	"id": "0d94572f-6f9d-43a3-94d7-76eb167ddc7f",
	"user": UserBasic,
	"description": "This looks ready.",
	"datePublished": "2021-11-01T05:17:11.915Z"
};

const Geo = {
	"lng": 123,
	"lat": 123,
	"country": "Canada",
	"city": "Calgary",
	"region": "AB"
};

const Image = {
	"id": "0788ff92-13e9-4481-9305-30aa52c13d46",
	"url": "https://www.adorama.com/alc/wp-content/uploads/2018/11/landscape-photography-tips-yosemite-valley-feature.jpg",
	"owner": UserHost,
	"dateUploaded": "2021-11-01T05:17:10.915Z",
	"note": "Great view!",
	"exif": {
		"Aperture": "F2.2",
		"Focal Point": "4.2 mm"
	}
};

const Post = {
	"id": "d9aca8f4-6ddf-4d37-b184-ab05fd0a39bb",
	"host": UserHost,
	"description": "Hello World! First post ever! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
	"gallery": [ 
		Image, 
		{
			...Image,
			url: "https://wallpaperaccess.com/full/2382371.jpg",
			owner: UserBasic
		},
		{
			...Image,
			url: "https://cdn.wallpaperhub.app/cloudcache/4/5/5/4/c/a/4554cad45b7f8130176b0a2921c4748249a2ea9a.jpg",
			owner: UserBasic
		 }
	],
	"guests": [ UserBasic, UserBasic, UserBasic, UserBasic, UserBasic ],
	"geo": Geo,
	"comments": [ Comment ],
	
	"dateCreated": "2021-11-01T05:16:10.915Z",
	"dateModified": "2021-11-01T05:16:10.915Z",
	"datePosted": "2021-11-01T05:17:10.915Z",
	"dateScheduled": "2021-11-01T05:17:10.915Z",
	"visibility": ["PUBLIC", "PRIVATE", "CUSTOM"],
	"autoAccept": true,
	"byod": ["GEAR_PROVIDED", "YES"],
	"notes": [ Note ]
};

export default Post