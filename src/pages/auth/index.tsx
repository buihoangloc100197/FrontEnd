export default function Auth() {
    return (
        <div>
            <button onClick={() => (window.location.href = '/auth/login')}>Login</button>
            <button onClick={() => (window.location.href = '/auth/register')}>Register</button>
        </div>
    );
}