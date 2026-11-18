export function CopyrightSection() {
  return (
    <div className="bg-background py-8">
      <div className="px-4 md:container md:mx-auto">
        <p className="text-sm text-muted-foreground text-center">
          <a
            href="https://github.com/bakumon1107/action-board"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            元ソースコード
          </a>{" "}
          ｜
          <a
            href="https://github.com/team-mirai/action-board"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            派生元
          </a>{" "}
          ｜ GNU Affero General Public License v3.0
        </p>
      </div>
    </div>
  );
}
