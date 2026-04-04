import Sidebar from "./components/Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return <Sidebar>{children}</Sidebar>;
};

export default MainLayout;
