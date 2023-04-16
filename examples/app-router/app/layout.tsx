import React from 'react';
import { Providers } from './providers';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession();
	return (
		<html>
			<body>
				<h1>next-auth-steam</h1>
				<Link href="/">Home</Link>&nbsp;
				<Link href="/about">About</Link>&nbsp;
				{session&&<Link href="/me">{session.user?.name}</Link>}
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
