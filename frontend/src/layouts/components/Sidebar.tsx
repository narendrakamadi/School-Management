import * as React from "react";
import { NavLink } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentsIcon from "@mui/icons-material/Payments";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CampaignIcon from "@mui/icons-material/Campaign";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import Header from "./Header";
import { appMenuItems } from "../../config/menu";
import { usePermission } from "../../hooks/usePermission";

const drawerWidth = 240;
const collapsedDrawerWidth = 72;

const Main = styled("main")(({ theme }) => ({
	flexGrow: 1,
	padding: theme.spacing(3),
	transition: theme.transitions.create(["margin", "width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
}));

const DrawerHeader = styled("div", {
	shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	...theme.mixins.toolbar,
	justifyContent: "center",
}));

const ToolbarSpacer = styled("div")(({ theme }) => ({
	...theme.mixins.toolbar,
}));

type SidebarProps = {
	children: React.ReactNode;
};

const menuIconByKey: Record<string, React.ReactNode> = {
	dashboard: <DashboardIcon />,
	students: <SchoolIcon />,
	teachers: <PersonIcon />,
	staff: <BadgeIcon />,
	classes: <ClassIcon />,
	sections: <ClassIcon />,
	subjects: <MenuBookIcon />,
	attendance: <FactCheckIcon />,
	"exams-results": <AssignmentTurnedInIcon />,
	"fees-management": <PaymentsIcon />,
	timetable: <ScheduleIcon />,
	announcements: <CampaignIcon />,
	reports: <BarChartIcon />,
	settings: <SettingsIcon />,
};

const Sidebar = ({ children }: SidebarProps) => {
	const theme = useTheme();
	const [open, setOpen] = React.useState(true);
	const { canAccess } = usePermission();

	const visibleMenuItems = React.useMemo(
		() => appMenuItems.filter((item) => canAccess(item.access)),
		[canAccess],
	);

	const handleToggleDrawer = () => {
		setOpen((prev) => !prev);
	};

	return (
		<Box sx={{ display: "flex" }}>
			<Header open={open} onToggleDrawer={handleToggleDrawer} />

			<Drawer
				sx={{
					width: open ? drawerWidth : collapsedDrawerWidth,
					flexShrink: 0,
					whiteSpace: "nowrap",
					"& .MuiDrawer-paper": {
						width: open ? drawerWidth : collapsedDrawerWidth,
						boxSizing: "border-box",
						overflowX: "hidden",
						transition: theme.transitions.create("width", {
							easing: theme.transitions.easing.sharp,
							duration: open
								? theme.transitions.duration.enteringScreen
								: theme.transitions.duration.leavingScreen,
						}),
					},
				}}
				variant="permanent"
				anchor="left"
			>
				<DrawerHeader open={open}>
					<IconButton onClick={handleToggleDrawer}>
						{open ? (
							theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />
						) : theme.direction === "ltr" ? (
							<ChevronRightIcon />
						) : (
							<ChevronLeftIcon />
						)}
					</IconButton>
				</DrawerHeader>
				<Divider />
				<List>
					{visibleMenuItems.map((item) => (
						<ListItem key={item.key} disablePadding>
							<ListItemButton
								{...(item.to
									? { component: NavLink, to: item.to }
									: { disabled: true })}
								sx={{
									minHeight: 48,
									justifyContent: open ? "initial" : "center",
									px: 2.5,
									...(item.to
										? {}
										: {
											opacity: 0.65,
											cursor: "not-allowed",
										}),
									"&.active": {
										backgroundColor: "action.selected",
									},
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: 0,
										mr: open ? 2 : "auto",
										justifyContent: "center",
									}}
								>
									{menuIconByKey[item.key]}
								</ListItemIcon>
								<ListItemText
									primary={item.label}
									sx={{
										opacity: open ? 1 : 0,
										display: open ? "block" : "none",
									}}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Drawer>

			<Main>
				<ToolbarSpacer />
				{children}
			</Main>
		</Box>
	);
};

export default Sidebar;

