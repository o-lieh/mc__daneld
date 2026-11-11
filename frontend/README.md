\# Farm App – Frontend



\## Overview



This is the frontend of farm application built with React and Vite. It uses Tailwind CSS for styling and provides a modern development environment with reusable UI libraries and components.



\## Tech Stack



\- \*\*React 19\*\* – Frontend library

\- \*\*Vite 8\*\* – Development server and build tool

\- \*\*Tailwind CSS 4\*\* – Utility-first CSS framework

\- \*\*React Router DOM 7\*\* – Client-side routing

\- \*\*React Hook Form\*\* – Form management

\- \*\*Lucide React\*\* – Icon library

\- \*\*React Multi Date Picker\*\* – Date picker component

\- \*\*Vazirmatn\*\* – Typography and font support



\## Prerequisites



Make sure the following tools are installed before running the project:



\- \*\*Node.js:\*\* `20.19+` or `22.12+`

\- \*\*npm:\*\* Included with Node.js

\- \*\*Git:\*\* Required to clone the repository



You can verify your installations using:



```bash

node -v

npm -v

git --version

```



\## Getting Started



\### 1. Clone the Repository



```bash

git clone https://github.com/o-lieh/mc\_\_daneld.git

```



\### 2. Navigate to the Project Directory



```bash

cd <project-directory>

```



\### 3. Install Dependencies



Install all required dependencies using npm:



```bash

npm ci

```



This command installs the exact dependency versions specified in `package-lock.json`.



Alternatively, you can use:



```bash

npm install

```



\### 4. Start the Development Server



Run the following command:



```bash

npm run dev

```



Vite will start the local development server. Open the URL displayed in your terminal (usually `http://localhost:5173`) in your browser.



\## Available Scripts



| Command | Description |

|---|---|

| `npm run dev` | Starts the development server |

| `npm run build` | Creates an optimized production build |

| `npm run preview` | Previews the production build locally |



\## Building for Production



To generate the production-ready files, run:



```bash

npm run build

```



The generated build files will be available in the `dist/` directory.



To preview the production build locally:



```bash

npm run preview

```



