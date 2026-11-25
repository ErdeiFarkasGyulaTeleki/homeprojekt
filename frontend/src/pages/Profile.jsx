import { useAuth } from "../context/useAuth";

export default function Profile() {
    const { user } = useAuth();

    return (
        <section className="profile-card">
            <p className="eyebrow">Bejelentkezett felhasználó</p>
            <h1>Profil</h1>
            {user && (
                <dl>
                    <div>
                        <dt>Név</dt>
                        <dd>{user.name}</dd>
                    </div>
                    <div>
                        <dt>Email</dt>
                        <dd>{user.email}</dd>
                    </div>
                    <div>
                        <dt>Azonosító</dt>
                        <dd>{user.id}</dd>
                    </div>
                    {user.role && (
                        <div>
                            <dt>Jogosultság</dt>
                            <dd>{user.role}</dd>
                        </div>
                    )}
                </dl>
            )}
        </section>
    );
}
