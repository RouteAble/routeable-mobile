
<h1 align="center">RouteAble Frontend</h3>

  <p align="center">
RouteAble is a map-based application that uses crowd-sourced data to help disabled people determine accessible areas. Our technology uses ML for image similarities and tag generation, blockchain to incentivize users, and React Native for hosting on Android and iOS devices. We hope to promote a more inclusive space by helping users upload, share, and idenitfy areas with stairs, ramps, asphalt roads, concrete roads, and guard rails. <br /> <br /> This repo contains code for the front-end design and integration with back-end found in the Routeable-ML-Backend Repo (https://github.com/RouteAble/routable-ml-backend) and Routeable-Backend Repo (https://github.com/RouteAble/routeable-backend). <br />
    <br/>
    <a href="https://github.com/RouteAble/routeable-mobile/README.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://docs.google.com/presentation/d/145E9zU8xtpnWF9hRp2KIpmkV4GY5TStbv_fuzdng2to/edit?usp=sharing">View Demo</a>
    ·
    <a href="https://github.com/orgs/RouteAble/discussions">Report Bugs</a>  
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

We were inspired by fellow UMass Amherst students who identified the lack of accessibility here on campus including dangerous ramps, hidden entrances, and unsafe roads. Students have the option to wait for "Classroom Access Assistants" and Accessible Van Services provided by the university, which are not always the most consistent and can cause frustration. Our application ensures that disabled people know ahead of time which buildings have accessible entrances and where they are using other user's images. Using machine learning, we identified exact matches between images above a certain threshold and automatically generate tags for our users. For quality control, we additionally have an edit tag function to manually edit generated tags. We also identified the challenge of incentivizing users. Hence, we developed a cryptocurrency wallet that allows users to collect tokens if their image is unique enough. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [React Native](https://reactnative.dev/)
* [Nest.js](https://nestjs.com/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [Google Map API](https://developers.google.com/maps)
* [.Tech Domain](https://get.tech/mlh)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Instructions on setting up our project locally.
To get a local copy up and running follow these simple example steps.
1. Clone the repo.
2. Install dependencies
```sh
npm install
```
OR 
```sh
yarn install
```
3. Start the server
```sh
npm expo start
```
OR
```sh
yarn expo start
```
3. Choose the platform of choice. React Native documents to set up your own emulator space can be found at [https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup).

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [https://mapsplatform.google.com/](https://mapsplatform.google.com/)
2. Clone the repos individually
   ```sh
   git clone [https://github.com/github_username/repo_name.git](https://github.com/RouteAble)
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

For more examples, please refer to the [Documentation](https://github.com/RouteAble).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Divyansh Shivashok - dshivashok@umass.edu
Shishir Pai - skpai@umass.edu
Ayush Ravi Chandran - ayushravicha@umass.edu
Zara Nip - znip@uchicago.edu

Project Link: [https://github.com/RouteAble](https://github.com/RouteAble)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
