/// <reference types="@react-telegram/core" />

import React, { PropsWithChildren } from "react";
import { MemoryRouter, Outlet, Route, Routes, To, useLocation, useNavigate, useParams } from "react-router-dom";
import { MtcuteAdapter } from "@react-telegram/mtcute-adapter";

export const ReactRouterExperiment = () => {
    return (
        <MemoryRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Homepage />} />
                    <Route path="blogs" element={<BlogsIndex />} />
                    <Route path="blogs/:id" element={<BlogPage />} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
};

export const Layout = () => {
    const location = useLocation();

    return (
        <>
            <i>path: {location.pathname}</i>
            <br />
            <br />
            <Outlet />
        </>
    );
};

export const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)}>
            ⬅️ Back
        </button>
    );
};

export const NavigateButton = ({
    to,
    children,
}: PropsWithChildren<{
    to: To
}>) => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(to)}>
            {children}
        </button>
    );
};

export const Homepage = () => {
    return (
        <>
            <b>This is the homepage</b>
            <br />
            <br />
            <row>
                <NavigateButton to="/blogs">
                    📝 Blogs
                </NavigateButton>
            </row>
        </>
    );
};

export const BlogsIndex = () => {
    const navigate = useNavigate();

    return (
        <>
            <row>
                <BackButton />
            </row>
            <br />
            <b>Please select a post :3</b>
            <br />
            <br />
            <row>
                <button onClick={() => navigate(`/blogs/0`)}>Post 0</button>
                <button onClick={() => navigate(`/blogs/1`)}>Post 1</button>
            </row>
            <row>
                <button onClick={() => navigate(`/blogs/2`)}>Post 2</button>
                <button onClick={() => navigate(`/blogs/3`)}>Post 3</button>
            </row>
        </>
    );
};

export const BlogPage = () => {
    const { id = "unknown" } = useParams();

    return (
        <>
            <row>
                <BackButton />
            </row>
            <br />
            <b>Blog page for: {id}</b>
            <br />
            <br />
            <i>This is the content for blog post #{id}</i>
        </>
    );
};

// Bot setup
async function main() {
    const config = {
        apiId: parseInt(process.env.API_ID || '0'),
        apiHash: process.env.API_HASH || '',
        storage: process.env.STORAGE_PATH || '.mtcute'
    };
    
    const botToken = process.env.BOT_TOKEN || '';
    
    if (!config.apiId || !config.apiHash || !botToken) {
        console.error('Please set API_ID, API_HASH, and BOT_TOKEN environment variables');
        process.exit(1);
    }
    
    const adapter = new MtcuteAdapter(config);
    
    adapter.onCommand('router', () => <ReactRouterExperiment />);
    
    await adapter.start(botToken);
    
    console.log('Bot is running! Send /router to see React Router example.');
}

main().catch(console.error);