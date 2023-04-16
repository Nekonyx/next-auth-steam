import { getServerSession } from 'next-auth';
import { SignIn, SignOut } from './Sign';

export default async function IndexPage() {
	const session = await getServerSession();

	return (
		<div>
			{session ? (
				<>
					<p>Hi, you're here!</p>
					<SignOut />
				</>
			) : (
				<>
					Do you want to play with me?{" "}
					<SignIn />
				</>
			)}
		</div>
	);
}
